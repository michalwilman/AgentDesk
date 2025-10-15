import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot, MessageSquare, Zap, Shield, Sparkles, ArrowRight, Mail, Twitter, Linkedin } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in">
            <div className="bg-gradient-to-br from-primary-400 to-secondary p-2.5 rounded-2xl shadow-soft">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-secondary bg-clip-text text-transparent">
              AgentDesk
            </h1>
          </div>
          <div className="flex items-center space-x-3 animate-fade-in delay-100">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-900 hover:text-primary-700 hover:bg-primary-50 transition-smooth rounded-full px-6">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-primary-600 to-secondary hover:shadow-soft-lg transition-smooth rounded-full px-6 py-2.5 text-white font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-pink py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-light rounded-full blur-3xl opacity-20 animate-pulse delay-300"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-soft text-sm">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span className="text-gray-900 font-medium">AI-Powered Customer Support</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                AI-Powered Customer Service
                <br />
                <span className="bg-gradient-to-r from-primary-700 to-secondary bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Create intelligent chatbots that learn from your website content and provide instant, accurate responses to your customers 24/7.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-primary-600 to-secondary hover:shadow-soft-lg transition-smooth rounded-full px-8 py-6 text-white font-semibold text-lg group">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-2 border-primary-400 text-primary-700 hover:bg-primary-50 transition-smooth rounded-full px-8 py-6 font-semibold text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Placeholder for illustration */}
            <div className="relative animate-fade-in delay-200">
              <div className="bg-white/60 backdrop-blur rounded-3xl p-8 shadow-soft-lg border border-primary-100 animate-float">
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-light rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Bot className="h-32 w-32 text-primary-600 mx-auto" />
                    <p className="text-sm text-gray-500 italic">
                      [Place your hero image or illustration here]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make customer support effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-3xl bg-gradient-pink hover-lift border border-primary-100 animate-fade-in delay-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary text-white mb-6 shadow-soft">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Smart Conversations</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered responses based on your content using GPT-4 technology for natural, helpful interactions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-3xl bg-gradient-pink hover-lift border border-primary-100 animate-fade-in delay-200">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary text-white mb-6 shadow-soft">
                <Zap className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Easy Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Just enter your website URL and we'll automatically learn from your content. No coding required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-3xl bg-gradient-pink hover-lift border border-primary-100 animate-fade-in delay-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary text-white mb-6 shadow-soft">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is encrypted and isolated with row-level security. Enterprise-grade protection.
              </p>
            </div>
          </div>

          {/* RTL Support Note */}
          <div className="text-center mt-12 animate-fade-in delay-400">
            <p className="text-gray-500 text-sm">
              • Full Hebrew (RTL) support included
            </p>
          </div>
        </div>
      </section>

      {/* Secondary Content Section */}
      <section className="py-24 bg-gradient-pink-reverse">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="order-2 md:order-1 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 shadow-soft-lg border border-primary-100">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-light rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Sparkles className="h-20 w-20 text-primary-600 mx-auto" />
                    <p className="text-sm text-gray-500 italic">
                      [Showcase image: Bot in action]
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="order-1 md:order-2 space-y-6 animate-fade-in delay-200">
              <h2 className="text-4xl md:text-5xl font-bold">
                Engage Your Customers Like Never Before
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transform your customer experience with AI that understands context, learns from your content, and provides personalized support around the clock.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="bg-primary-100 rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-gray-700">Instant responses to customer inquiries</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-primary-100 rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-gray-700">Reduces support workload by up to 80%</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-primary-100 rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-gray-700">Works in multiple languages including Hebrew</span>
                </li>
              </ul>
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-primary-600 to-secondary hover:shadow-soft-lg transition-smooth rounded-full px-8 py-6 text-white font-semibold">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join hundreds of businesses using AgentDesk for intelligent, automated customer support.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-primary-600 to-secondary hover:shadow-soft-lg transition-smooth rounded-full px-12 py-7 text-white font-semibold text-lg group">
                Create Your Free Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary-400 to-secondary p-2 rounded-xl">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">AgentDesk</h4>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered customer service that works 24/7
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Contact</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="mailto:support@agentdesk.com" className="flex items-center space-x-2 hover:text-primary-600 transition-smooth">
                  <Mail className="h-4 w-4" />
                  <span>support@agentdesk.com</span>
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-white p-2.5 rounded-full shadow-soft hover:shadow-soft-lg transition-smooth hover:-translate-y-1">
                  <Twitter className="h-5 w-5 text-primary-600" />
                </a>
                <a href="#" className="bg-white p-2.5 rounded-full shadow-soft hover:shadow-soft-lg transition-smooth hover:-translate-y-1">
                  <Linkedin className="h-5 w-5 text-primary-600" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 AgentDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget - Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-gradient-to-r from-primary-600 to-secondary text-white rounded-full p-5 shadow-soft-lg hover:shadow-xl hover:scale-110 transition-smooth group">
          <MessageSquare className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </main>
  )
}

