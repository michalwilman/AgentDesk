import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot, MessageSquare, Zap, Shield, Sparkles, ArrowRight, Mail, Twitter, Linkedin, Github, Instagram, Globe, Settings } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur-sm border-b border-dark-100 shadow-glow">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in">
            <div className="bg-gradient-cyan p-2.5 rounded-2xl shadow-glow">
              <Bot className="h-6 w-6 text-dark" />
            </div>
            <h1 className="text-2xl font-bold text-primary text-glow">
              AgentDesk
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-dark-800 hover:text-primary transition-smooth font-medium">
              Features
            </a>
            <Link href="/pricing" className="text-dark-800 hover:text-primary transition-smooth font-medium">
              Pricing
            </Link>
            <Link href="/about" className="text-dark-800 hover:text-primary transition-smooth font-medium">
              About
            </Link>
            <Link href="/support" className="text-dark-800 hover:text-primary transition-smooth font-medium">
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
      <section className="bg-gradient-dark py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse delay-300"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-dark-50/80 backdrop-blur px-4 py-2 rounded-full shadow-glow text-sm border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-white font-medium">AI-Powered Customer Support</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                AI-Powered Customer Service
                <br />
                <span className="text-primary text-glow">
                  for Your Website
                </span>
              </h1>
              
              <p className="text-xl text-dark-800 leading-relaxed max-w-xl">
                Build your own intelligent chatbot that learns from your content and answers your customers automatically.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register?plan=starter">
                  <Button size="lg" className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-8 py-6 text-dark font-semibold text-lg group">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 transition-smooth rounded-full px-8 py-6 font-semibold text-lg">
                    Watch Demo
                  </Button>
                </a>
              </div>
            </div>

            {/* Right side - Placeholder for illustration */}
            <div className="relative animate-fade-in delay-200">
              <div className="bg-dark-50/60 backdrop-blur rounded-3xl p-8 shadow-glow-lg border border-primary/20 animate-float">
                <div className="aspect-square bg-gradient-dark-reverse rounded-2xl flex items-center justify-center border border-primary/10">
                  <div className="text-center space-y-4">
                    <Bot className="h-32 w-32 text-primary mx-auto" />
                    <p className="text-sm text-dark-800 italic">
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
      <section id="features" className="py-24 bg-dark">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Everything You Need
            </h2>
            <p className="text-xl text-dark-800 max-w-2xl mx-auto">
              Powerful features designed to make customer support effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 animate-fade-in delay-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Smart Conversations</h3>
              <p className="text-dark-800 leading-relaxed">
                Personalized responses based on your business data
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 animate-fade-in delay-200">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Settings className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Easy Integration</h3>
              <p className="text-dark-800 leading-relaxed">
                Works with WordPress, Elementor, and Shopify
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 animate-fade-in delay-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Secure & Private</h3>
              <p className="text-dark-800 leading-relaxed">
                Isolated data environment for each business
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 animate-fade-in delay-400">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Globe className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Multi-Language Support</h3>
              <p className="text-dark-800 leading-relaxed">
                Full Hebrew and RTL support included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Content Section */}
      <section className="py-24 bg-gradient-dark-reverse">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="order-2 md:order-1 animate-fade-in">
              <div className="bg-dark-50 rounded-3xl p-8 shadow-glow-lg border border-primary/20">
                <div className="aspect-video bg-gradient-dark rounded-2xl flex items-center justify-center border border-primary/10">
                  <div className="text-center space-y-2">
                    <Sparkles className="h-20 w-20 text-primary mx-auto" />
                    <p className="text-sm text-dark-800 italic">
                      [Showcase image: Bot in action]
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="order-1 md:order-2 space-y-6 animate-fade-in delay-200">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Engage Your Customers Like Never Before
              </h2>
              <p className="text-xl text-dark-800 leading-relaxed">
                Transform your customer experience with AI that understands context, learns from your content, and provides personalized support around the clock.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="bg-primary/20 rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-dark-800">Instant responses to customer inquiries</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-primary/20 rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-dark-800">Reduces support workload by up to 80%</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-primary/20 rounded-full p-1 mt-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-dark-800">Works in multiple languages including Hebrew</span>
                </li>
              </ul>
              <Link href="/register?plan=starter">
                <Button size="lg" className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-8 py-6 text-dark font-semibold">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-xl text-dark-800 max-w-2xl mx-auto">
              See how AgentDesk is transforming customer support
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-dark-50 p-8 rounded-3xl border border-primary/20 shadow-glow hover-lift animate-fade-in delay-100">
              <div className="mb-6">
                <div className="flex text-primary mb-4">
                  <span className="text-2xl">★★★★★</span>
                </div>
                <p className="text-dark-800 leading-relaxed italic mb-6">
                  "Since installing AgentDesk, our support volume decreased by 70%. The AI handles most common questions perfectly."
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-cyan flex items-center justify-center text-dark font-bold">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-white">Sarah Mitchell</div>
                  <div className="text-sm text-dark-800">CEO, TechStart Inc.</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-dark-50 p-8 rounded-3xl border border-primary/20 shadow-glow hover-lift animate-fade-in delay-200">
              <div className="mb-6">
                <div className="flex text-primary mb-4">
                  <span className="text-2xl">★★★★★</span>
                </div>
                <p className="text-dark-800 leading-relaxed italic mb-6">
                  "The setup was incredibly easy. Within 30 minutes, our chatbot was live and answering customer questions accurately."
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-cyan flex items-center justify-center text-dark font-bold">
                  DK
                </div>
                <div>
                  <div className="font-semibold text-white">David Kim</div>
                  <div className="text-sm text-dark-800">Founder, ShopEasy</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-dark-50 p-8 rounded-3xl border border-primary/20 shadow-glow hover-lift animate-fade-in delay-300">
              <div className="mb-6">
                <div className="flex text-primary mb-4">
                  <span className="text-2xl">★★★★★</span>
                </div>
                <p className="text-dark-800 leading-relaxed italic mb-6">
                  "Game changer for our customer service. 24/7 support without hiring additional staff. Highly recommend!"
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-cyan flex items-center justify-center text-dark font-bold">
                  RC
                </div>
                <div>
                  <div className="font-semibold text-white">Rachel Cohen</div>
                  <div className="text-sm text-dark-800">COO, Digital Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-dark-reverse border-t border-primary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Build Your AI Assistant?</h2>
            <p className="text-xl text-dark-800 leading-relaxed">
              Join hundreds of businesses using AgentDesk for smarter customer support.
            </p>
            <Link href="/register?plan=starter">
              <Button size="lg" className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-12 py-7 text-dark font-semibold text-lg group">
                Create Your Free Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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

      {/* Chat Widget - Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-gradient-cyan text-dark rounded-full p-5 shadow-glow-lg hover:shadow-glow hover:scale-110 transition-smooth group">
          <MessageSquare className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 bg-primary h-4 w-4 rounded-full border-2 border-dark animate-pulse"></span>
        </button>
      </div>
    </main>
  )
}

