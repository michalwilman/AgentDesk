import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, CheckCircle2, Globe, Zap, Shield, ArrowLeft, ExternalLink } from 'lucide-react'

export default function WordPressPluginPage() {
  return (
    <div className="min-h-screen bg-dark py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Globe className="h-4 w-4" />
            WordPress Plugin
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            AgentDesk for WordPress
          </h1>
          <p className="text-xl text-dark-800 max-w-2xl mx-auto">
            Add your AI-powered chatbot to any WordPress site in minutes. 
            No coding required.
          </p>
        </div>

        {/* Download Card - Prominent */}
        <Card className="mb-12 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl mb-2">Download Plugin v1.1.0</CardTitle>
            <CardDescription className="text-base">
              Latest version with automatic connection tracking and dashboard integration
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <a 
              href="/downloads/agentdesk-chatbot-v1.1.0.zip" 
              download="agentdesk-chatbot.zip"
            >
              <Button size="lg" className="gap-2 text-lg px-8 py-6 h-auto">
                <Download className="h-6 w-6" />
                Download Plugin (22KB)
              </Button>
            </a>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-dark-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                WordPress 5.8+
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                PHP 7.4+
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Free & Open Source
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Easy Installation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-dark-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Upload and activate in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Simple one-field configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Works with any WordPress theme</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Powerful Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-dark-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Dashboard connection tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Customizable widget position</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Full Hebrew/RTL support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-dark-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Secure token-based authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Automatic updates available</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Privacy-focused design</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Installation Steps */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Installation Guide</CardTitle>
            <CardDescription>Get your AI chatbot running on WordPress in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-dark flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Download & Upload</h3>
                  <p className="text-dark-800 mb-3">
                    Download the plugin ZIP file using the button above. Then, in your WordPress admin panel:
                  </p>
                  <div className="bg-dark-50 border border-dark-100 rounded-lg p-4 space-y-2 text-sm">
                    <p className="text-dark-800">1. Go to <span className="text-white font-mono">Plugins → Add New → Upload Plugin</span></p>
                    <p className="text-dark-800">2. Click <span className="text-white font-mono">Choose File</span> and select the downloaded ZIP</p>
                    <p className="text-dark-800">3. Click <span className="text-white font-mono">Install Now</span></p>
                    <p className="text-dark-800">4. Click <span className="text-white font-mono">Activate Plugin</span></p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-dark flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Get Your Bot API Token</h3>
                  <p className="text-dark-800 mb-3">
                    You need your Bot API Token from the AgentDesk dashboard:
                  </p>
                  <div className="bg-dark-50 border border-dark-100 rounded-lg p-4 space-y-2 text-sm">
                    <p className="text-dark-800">1. Go to your <Link href="/dashboard" className="text-primary hover:underline">AgentDesk Dashboard</Link></p>
                    <p className="text-dark-800">2. Click on your bot</p>
                    <p className="text-dark-800">3. Copy the <span className="text-white font-mono">API Token</span> (starts with <span className="text-white font-mono">bot_</span>)</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-dark flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Configure & Launch</h3>
                  <p className="text-dark-800 mb-3">
                    Connect your WordPress site to your AgentDesk bot:
                  </p>
                  <div className="bg-dark-50 border border-dark-100 rounded-lg p-4 space-y-2 text-sm">
                    <p className="text-dark-800">1. In WordPress, go to <span className="text-white font-mono">Settings → AgentDesk</span></p>
                    <p className="text-dark-800">2. Paste your Bot API Token</p>
                    <p className="text-dark-800">3. Choose widget position (optional)</p>
                    <p className="text-dark-800">4. Click <span className="text-white font-mono">Save Settings</span></p>
                  </div>
                  <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-primary font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Done! Your chatbot is now live on your WordPress site.
                    </p>
                    <p className="text-dark-800 text-sm mt-2">
                      Check your AgentDesk dashboard to see the connection status and monitor activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's New */}
        <Card className="mb-12 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">What's New in v1.1.0</CardTitle>
            <CardDescription>Latest features and improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">WordPress Integration Tracking</h4>
                  <p className="text-dark-800">
                    Your dashboard now shows if your WordPress plugin is connected, which site it's on, and when it last synced.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Automatic Heartbeat System</h4>
                  <p className="text-dark-800">
                    The plugin automatically syncs with AgentDesk every 5 minutes to maintain connection status.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Enhanced Dashboard Display</h4>
                  <p className="text-dark-800">
                    See your WordPress site URL, plugin version, and last activity timestamp directly in your bot configuration.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Improved Stability</h4>
                  <p className="text-dark-800">
                    Better error handling and cross-platform compatibility improvements.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">System Requirements</CardTitle>
            <CardDescription>Make sure your WordPress site meets these requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Minimum Requirements</h4>
                <ul className="space-y-2 text-dark-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    WordPress 5.8 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    PHP 7.4 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    MySQL 5.6 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    HTTPS enabled (recommended)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Recommended</h4>
                <ul className="space-y-2 text-dark-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    WordPress 6.0 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    PHP 8.0 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    MySQL 8.0 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    WP Cron enabled
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support & Documentation */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Need Help?</CardTitle>
            <CardDescription>Resources and support options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="https://github.com/yourusername/agentdesk/tree/main/wordpress-plugin" 
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="border border-dark-100 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Documentation</h4>
                    <ExternalLink className="h-4 w-4 text-dark-800" />
                  </div>
                  <p className="text-sm text-dark-800">
                    Detailed installation guide, FAQs, and troubleshooting tips
                  </p>
                </div>
              </a>
              
              <Link href="/support">
                <div className="border border-dark-100 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Support Center</h4>
                    <ExternalLink className="h-4 w-4 text-dark-800" />
                  </div>
                  <p className="text-sm text-dark-800">
                    Get help from our support team via email or live chat
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Add AI to Your WordPress Site?
          </h2>
          <p className="text-dark-800 mb-8 max-w-2xl mx-auto">
            Download the plugin now and start engaging with your visitors using AI-powered conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/downloads/agentdesk-chatbot-v1.1.0.zip" 
              download="agentdesk-chatbot.zip"
            >
              <Button size="lg" className="gap-2">
                <Download className="h-5 w-5" />
                Download Plugin
              </Button>
            </a>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-dark-800">
          <p>
            Free to use. Open source. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  )
}

