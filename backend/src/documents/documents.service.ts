import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/supabase.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import * as mammoth from 'mammoth';

@Injectable()
export class DocumentsService {
  // Supabase project file size limit (configurable via environment)
  private readonly SUPABASE_PROJECT_MAX_FILE_SIZE: number;

  // User tier limits (ideal limits for each subscription tier)
  private readonly MAX_FILE_SIZE_FREE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_FILE_SIZE_PRO = 20 * 1024 * 1024; // 20MB
  private readonly MAX_FILE_SIZE_BUSINESS = 100 * 1024 * 1024; // 100MB

  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private embeddingsService: EmbeddingsService,
  ) {
    // Read Supabase project limit from environment, default to 50MB (free tier)
    const envLimit = this.configService.get<string>(
      'SUPABASE_MAX_FILE_SIZE',
      '52428800', // 50MB in bytes
    );
    this.SUPABASE_PROJECT_MAX_FILE_SIZE = parseInt(envLimit, 10);

    // Log the configured limit for debugging
    console.log(
      `📦 Supabase max file size: ${(this.SUPABASE_PROJECT_MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB`,
    );
  }

  async uploadDocument(
    file: Express.Multer.File,
    botId: string,
    userId: string,
  ) {
    const supabase = this.supabaseService.getClient();

    // Get user subscription tier
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const subscriptionTier = user?.subscription_tier || 'free';

    // Validate file size based on subscription
    this.validateFileSize(file.size, subscriptionTier);

    // Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: PDF, TXT, DOC, DOCX`,
      );
    }

    // Sanitize filename
    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const storagePath = `${botId}/${Date.now()}_${sanitizedFilename}`;

    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Create initial database record with pending status
      const { data: document, error: dbError } = await supabase
        .from('scraped_content')
        .insert([
          {
            bot_id: botId,
            source_url: 'document',
            content_type: this.getFileType(file.mimetype),
            title: sanitizedFilename,
            content: '', // Will be filled after processing
            file_name: sanitizedFilename,
            file_size: file.size,
            file_type: this.getFileType(file.mimetype),
            storage_path: storagePath,
            processing_status: 'pending',
            metadata: {
              original_name: file.originalname,
              mime_type: file.mimetype,
              upload_date: new Date().toISOString(),
            },
          },
        ])
        .select()
        .single();

      if (dbError) {
        // Cleanup uploaded file if database insert fails
        await supabase.storage.from('documents').remove([storagePath]);
        throw new Error(`Failed to create document record: ${dbError.message}`);
      }

      // Process document asynchronously
      this.processDocument(document.id, botId, file.buffer, file.mimetype).catch(
        (error) => {
          console.error(`Failed to process document ${document.id}:`, error);
        },
      );

      return document;
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to upload document');
    }
  }

  private async processDocument(
    documentId: string,
    botId: string,
    buffer: Buffer,
    mimeType: string,
  ) {
    const supabase = this.supabaseService.getClient();

    try {
      // Update status to processing
      await supabase
        .from('scraped_content')
        .update({ processing_status: 'processing' })
        .eq('id', documentId);

      // Extract text based on file type
      let extractedText = '';

      if (mimeType === 'application/pdf') {
        extractedText = await this.extractTextFromPDF(buffer);
      } else if (
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        extractedText = await this.extractTextFromDOCX(buffer);
      } else if (mimeType === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      } else if (mimeType === 'application/msword') {
        // For old .doc files, we'll treat as plain text (limited support)
        extractedText = buffer.toString('utf-8');
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      // Clean and normalize text
      const cleanedText = this.cleanText(extractedText);
      const wordCount = cleanedText.split(/\s+/).length;

      // Update document with extracted content
      await supabase
        .from('scraped_content')
        .update({
          content: cleanedText,
          word_count: wordCount,
          processing_status: 'completed',
        })
        .eq('id', documentId);

      // Generate embeddings
      await this.embeddingsService.generateEmbeddingsForContent(
        documentId,
        botId,
      );

      console.log(
        `Successfully processed document ${documentId}: ${wordCount} words`,
      );
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);

      // Update status to failed
      await supabase
        .from('scraped_content')
        .update({
          processing_status: 'failed',
          metadata: {
            error: error.message,
            failed_at: new Date().toISOString(),
          },
        })
        .eq('id', documentId);
    }
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      // Use require to avoid pdf-parse initialization issues
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  private async extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }

  private cleanText(text: string): string {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ');
    // Remove special characters but keep Hebrew, English, numbers, and basic punctuation
    cleaned = cleaned.replace(/[^\p{L}\p{N}\s.,!?;:()\-"']/gu, '');
    // Trim
    cleaned = cleaned.trim();
    return cleaned;
  }

  private sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    const basename = filename.replace(/^.*[\\\/]/, '');
    // Remove special characters except dots, dashes, and underscores
    const sanitized = basename.replace(/[^a-zA-Z0-9\u0590-\u05FF._-]/g, '_');
    return sanitized;
  }

  private validateFileSize(size: number, subscriptionTier: string) {
    // Determine tier-based limit
    let tierMaxSize = this.MAX_FILE_SIZE_FREE;

    if (subscriptionTier === 'pro') {
      tierMaxSize = this.MAX_FILE_SIZE_PRO;
    } else if (subscriptionTier === 'business' || subscriptionTier === 'enterprise') {
      tierMaxSize = this.MAX_FILE_SIZE_BUSINESS;
    }

    // Take the minimum between tier limit and Supabase project limit
    const effectiveMaxSize = Math.min(
      tierMaxSize,
      this.SUPABASE_PROJECT_MAX_FILE_SIZE,
    );

    if (size > effectiveMaxSize) {
      const maxSizeMB = (effectiveMaxSize / (1024 * 1024)).toFixed(0);

      // If project limit is the bottleneck, provide specific error message
      if (
        effectiveMaxSize === this.SUPABASE_PROJECT_MAX_FILE_SIZE &&
        tierMaxSize > this.SUPABASE_PROJECT_MAX_FILE_SIZE
      ) {
        const tierMaxMB = (tierMaxSize / (1024 * 1024)).toFixed(0);
        throw new BadRequestException(
          `File size exceeds project storage limit of ${maxSizeMB}MB. Your ${subscriptionTier} tier allows up to ${tierMaxMB}MB, but requires a Supabase plan upgrade.`,
        );
      }

      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB for ${subscriptionTier} tier`,
      );
    }
  }

  private getFileType(mimeType: string): string {
    const mimeMap = {
      'application/pdf': 'pdf',
      'text/plain': 'text',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
    };
    return mimeMap[mimeType] || 'file';
  }

  async getDocuments(botId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('scraped_content')
      .select(
        'id, file_name, file_size, file_type, processing_status, word_count, created_at, metadata',
      )
      .eq('bot_id', botId)
      .eq('source_url', 'document')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  }

  async deleteDocument(documentId: string, botId: string) {
    const supabase = this.supabaseService.getClient();

    // Get document details
    const { data: document, error: fetchError } = await supabase
      .from('scraped_content')
      .select('storage_path')
      .eq('id', documentId)
      .eq('bot_id', botId)
      .single();

    if (fetchError || !document) {
      throw new Error('Document not found');
    }

    // Delete from storage if storage_path exists
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path]);

      if (storageError) {
        console.error('Failed to delete from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete embeddings (cascade should handle this, but being explicit)
    await supabase
      .from('knowledge_embeddings')
      .delete()
      .eq('content_id', documentId)
      .eq('bot_id', botId);

    // Delete document record
    const { error: deleteError } = await supabase
      .from('scraped_content')
      .delete()
      .eq('id', documentId)
      .eq('bot_id', botId);

    if (deleteError) {
      throw new Error(`Failed to delete document: ${deleteError.message}`);
    }

    return { message: 'Document deleted successfully' };
  }
}

