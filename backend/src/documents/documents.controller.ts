import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Headers,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(
    private documentsService: DocumentsService,
    private authService: AuthService,
    private botsService: BotsService,
  ) {}

  private async validateAuth(authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const token = authorization.replace('Bearer ', '');
    return await this.authService.validateUser(token);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Headers('authorization') authorization: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
  ) {
    const user = await this.validateAuth(authorization);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Verify bot ownership
    await this.botsService.findOne(body.botId, user.id);

    const document = await this.documentsService.uploadDocument(
      file,
      body.botId,
      user.id,
    );

    return {
      message: 'Document uploaded successfully',
      document,
    };
  }

  @Get(':botId')
  async getDocuments(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);

    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    const documents = await this.documentsService.getDocuments(botId);

    return {
      documents,
      count: documents.length,
    };
  }

  @Delete(':documentId/:botId')
  async deleteDocument(
    @Headers('authorization') authorization: string,
    @Param('documentId') documentId: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);

    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.documentsService.deleteDocument(documentId, botId);
  }
}

