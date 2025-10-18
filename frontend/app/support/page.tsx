import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot, Mail, Clock, MessageSquare, HelpCircle, Book, Linkedin, Github, Instagram, ArrowRight } from 'lucide-react'
import HomeChatWidget from '@/components/home/HomeChatWidget'

export default function SupportPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-sm border-b border-dark-100 shadow-glow">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 animate-fade-in">
            <div className="bg-gradient-cyan p-2.5 rounded-2xl shadow-glow">
              <Bot className="h-6 w-6 text-dark" />
            </div>
            <h1 className="text-2xl font-bold text-primary text-glow">
              AgentDesk
            </h1>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-dark-800 hover:text-primary transition-smooth font-medium">
              Features
            </Link>
            <Link href="/pricing" className="text-dark-800 hover:text-primary transition-smooth font-medium">
              Pricing
            </Link>
            <Link href="/about" className="text-dark-800 hover:text-primary transition-smooth font-medium">
              About
            </Link>
            <Link href="/support" className="text-primary font-medium">
              Support
            </Link>
          </nav>
          
          <div className="flex items-center space-x-3 animate-fade-in delay-100">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-primary hover:bg-dark-50 transition-smooth rounded-full px-6">
                Login
              </Button>
            </Link>
            <Link href="/register?plan=starter">
              <Button className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-6 py-2.5 text-dark font-medium">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-dark py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              How Can We
              <br />
              <span className="text-primary text-glow">
                Help You?
              </span>
            </h1>
            <p className="text-xl text-dark-800 leading-relaxed">
              Get the support you need to succeed with AgentDesk
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Email Support */}
            <div className="text-center p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 shadow-glow animate-fade-in delay-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Mail className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Email Support</h3>
              <p className="text-dark-800 leading-relaxed mb-4">
                Get help via email from our support team
              </p>
              <a href="mailto:support@agentdesk.com" className="text-primary font-semibold hover:text-primary/80 transition-smooth">
                support@agentdesk.com
              </a>
            </div>

            {/* Response Time */}
            <div className="text-center p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 shadow-glow animate-fade-in delay-200">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Clock className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Response Time</h3>
              <p className="text-dark-800 leading-relaxed mb-4">
                We typically respond within
              </p>
              <p className="text-primary font-semibold text-xl">
                24 hours
              </p>
            </div>

            {/* Live Chat */}
            <div className="text-center p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 shadow-glow animate-fade-in delay-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Live Chat</h3>
              <p className="text-dark-800 leading-relaxed mb-4">
                Chat with our support team
              </p>
              <p className="text-primary font-semibold">
                Available 9am-6pm EST
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-dark-reverse">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-dark-800">
                Quick answers to common questions
              </p>
            </div>
            
            <div className="space-y-6">
              {/* FAQ 1 */}
              <div className="bg-dark-50 p-8 rounded-3xl shadow-glow border border-primary/20 animate-fade-in delay-100">
                <h3 className="text-2xl font-semibold mb-3 text-white">How do I get started with AgentDesk?</h3>
                <p className="text-dark-800 leading-relaxed">
                  Simply sign up for a free trial, create your first bot, and provide your website URL. 
                  Our system will automatically scrape and learn from your content. You'll have a working 
                  chatbot in under 30 minutes.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="bg-dark-50 p-8 rounded-3xl shadow-glow border border-primary/20 animate-fade-in delay-200">
                <h3 className="text-2xl font-semibold mb-3 text-white">Can I customize the chatbot's appearance?</h3>
                <p className="text-dark-800 leading-relaxed">
                  Yes! You can customize colors, position, greeting message, and more to match your brand. 
                  Pro and Business plans include advanced customization options.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="bg-dark-50 p-8 rounded-3xl shadow-glow border border-primary/20 animate-fade-in delay-300">
                <h3 className="text-2xl font-semibold mb-3 text-white">How does the AI learn from my content?</h3>
                <p className="text-dark-800 leading-relaxed">
                  Our AI uses advanced web scraping and natural language processing to understand your 
                  website content. It creates a knowledge base specific to your business and uses it to 
                  answer customer questions accurately.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="bg-dark-50 p-8 rounded-3xl shadow-glow border border-primary/20 animate-fade-in delay-400">
                <h3 className="text-2xl font-semibold mb-3 text-white">What integrations are available?</h3>
                <p className="text-dark-800 leading-relaxed">
                  We support WordPress, Elementor, Shopify, and standard website embedding via JavaScript. 
                  Business plans include custom integrations with CRMs and ERPs. Contact us for specific 
                  integration requirements.
                </p>
              </div>

              {/* FAQ 5 */}
              <div className="bg-dark-50 p-8 rounded-3xl shadow-glow border border-primary/20">
                <h3 className="text-2xl font-semibold mb-3 text-white">Is my data secure?</h3>
                <p className="text-dark-800 leading-relaxed">
                  Absolutely. We use enterprise-grade encryption and row-level security to ensure your data 
                  is completely isolated and protected. We're GDPR compliant and take data privacy seriously.
                </p>
              </div>

              {/* FAQ 6 */}
              <div className="bg-dark-50 p-8 rounded-3xl shadow-glow border border-primary/20">
                <h3 className="text-2xl font-semibold mb-3 text-white">Can I upgrade or downgrade my plan?</h3>
                <p className="text-dark-800 leading-relaxed">
                  Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades 
                  will apply at the start of your next billing cycle. No penalties for switching plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
              <Book className="h-10 w-10" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Documentation & Resources</h2>
            <p className="text-xl text-dark-800 leading-relaxed max-w-2xl mx-auto">
              Explore our comprehensive documentation to get the most out of AgentDesk. 
              From quick start guides to advanced features, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 transition-smooth rounded-full px-8 py-6 font-semibold text-lg">
                View Documentation
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 transition-smooth rounded-full px-8 py-6 font-semibold text-lg">
                API Reference
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-dark-reverse border-t border-primary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Still Have Questions?</h2>
            <p className="text-xl text-dark-800 leading-relaxed">
              Our support team is here to help. Reach out and we'll get back to you as soon as possible.
            </p>
            <a href="mailto:support@agentdesk.com">
              <Button size="lg" className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-12 py-7 text-dark font-semibold text-lg group">
                Contact Support
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-50 border-t border-dark-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-cyan p-2 rounded-xl shadow-glow">
                  <Bot className="h-5 w-5 text-dark" />
                </div>
                <h4 className="text-xl font-bold text-white">AgentDesk</h4>
              </div>
              <p className="text-dark-800 text-sm">
                AI-powered customer service that works 24/7
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Company</h4>
              <div className="space-y-2 text-sm text-dark-800">
                <div><Link href="/about" className="hover:text-primary transition-smooth">About</Link></div>
                <div><Link href="/pricing" className="hover:text-primary transition-smooth">Pricing</Link></div>
                <div><Link href="/support" className="hover:text-primary transition-smooth">Support</Link></div>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-dark-100 p-2.5 rounded-full shadow-glow hover:shadow-glow-lg transition-smooth hover:-translate-y-1 border border-primary/20">
                  <Linkedin className="h-5 w-5 text-primary" />
                </a>
                <a href="#" className="bg-dark-100 p-2.5 rounded-full shadow-glow hover:shadow-glow-lg transition-smooth hover:-translate-y-1 border border-primary/20">
                  <Github className="h-5 w-5 text-primary" />
                </a>
                <a href="#" className="bg-dark-100 p-2.5 rounded-full shadow-glow hover:shadow-glow-lg transition-smooth hover:-translate-y-1 border border-primary/20">
                  <Instagram className="h-5 w-5 text-primary" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-100 pt-8 text-center text-dark-800 text-sm space-y-2">
            <p>&copy; 2025 AgentDesk. All rights reserved.</p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="hover:text-primary transition-smooth">Terms</a>
              <span>|</span>
              <a href="#" className="hover:text-primary transition-smooth">Privacy</a>
              <span>|</span>
              <a href="mailto:support@agentdesk.com" className="hover:text-primary transition-smooth">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <HomeChatWidget />
    </main>
  )
}
