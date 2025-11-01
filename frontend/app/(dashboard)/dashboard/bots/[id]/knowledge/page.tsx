import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KnowledgeFileUpload } from '@/components/dashboard/knowledge-file-upload'
import { KnowledgeDocumentsTable } from '@/components/dashboard/knowledge-documents-table'
import { KnowledgeWebsiteCrawling } from '@/components/dashboard/knowledge-website-crawling'
import { ArrowLeft, BookOpen, FileText, Globe } from 'lucide-react'

export default async function KnowledgePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: bot } = await supabase
    .from('bots')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user?.id)
    .single()

  if (!bot) {
    notFound()
  }

  // Get documents count
  const { data: documents, count: documentsCount } = await supabase
    .from('scraped_content')
    .select('*', { count: 'exact' })
    .eq('bot_id', params.id)
    .eq('source_url', 'document')

  // Get total characters from all content
  const { data: allContent } = await supabase
    .from('scraped_content')
    .select('content')
    .eq('bot_id', params.id)

  const totalCharacters = allContent?.reduce((sum, item) => sum + (item.content?.length || 0), 0) || 0

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={`/dashboard/bots/${params.id}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bot
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Knowledge Base
        </h1>
        <p className="text-dark-800 mt-1">Train your bot with your content</p>
      </div>

      {/* Status Overview */}
      <Card className="mb-6 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-dark-800 mb-1">Training Status</div>
              <div className="flex items-center gap-2">
                {bot.is_trained ? (
                  <>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/20">
                      ✅ Trained
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-dark-100 text-dark-800 border border-dark-100">
                    ⚠️ Not Trained
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-800 mb-1">Documents</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {documentsCount || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-800 mb-1">Total Characters</div>
              <div className="text-2xl font-bold text-white">
                {totalCharacters.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Upload PDF, TXT, DOC, or DOCX files to train your bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeFileUpload botId={params.id} />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            Manage your uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeDocumentsTable botId={params.id} />
        </CardContent>
      </Card>

      {/* Website Crawling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Crawling
          </CardTitle>
          <CardDescription>
            Automatically extract content from your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeWebsiteCrawling botId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}

