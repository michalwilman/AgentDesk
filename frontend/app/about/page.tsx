import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot, Target, Users, Zap, Shield, Heart, Linkedin, Github, Instagram, ArrowRight } from 'lucide-react'
import HomeChatWidget from '@/components/home/HomeChatWidget'

export default function AboutPage() {
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
            <Link href="/about" className="text-primary font-medium">
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
      <section className="bg-gradient-dark py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              About
              <br />
              <span className="text-primary text-glow">
                AgentDesk
              </span>
            </h1>
            <p className="text-xl text-dark-800 leading-relaxed">
              Empowering businesses with intelligent AI-powered customer service solutions
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyan text-dark mb-4 shadow-glow">
                <Target className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-bold text-white">Our Mission</h2>
              <p className="text-lg text-dark-800 leading-relaxed">
                At AgentDesk, we believe that every business deserves access to intelligent, 
                automated customer support. Our mission is to make AI-powered chatbots accessible, 
                affordable, and easy to implement for businesses of all sizes.
              </p>
              <p className="text-lg text-dark-800 leading-relaxed">
                We're committed to helping companies provide exceptional customer service 
                without the overhead of traditional support teams, while maintaining the 
                personal touch that customers expect.
              </p>
            </div>
            
            <div className="relative animate-fade-in delay-200">
              <div className="bg-dark-50 rounded-3xl p-8 border border-primary/20 shadow-glow-lg">
                <div className="aspect-square bg-gradient-dark-reverse rounded-2xl flex items-center justify-center border border-primary/10">
                  <Bot className="h-32 w-32 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-dark-reverse">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Our Values
            </h2>
            <p className="text-xl text-dark-800 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Value 1 */}
            <div className="bg-dark-50 p-8 rounded-3xl shadow-glow hover-lift border border-primary/20 animate-fade-in delay-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Customer First</h3>
              <p className="text-dark-800 leading-relaxed">
                Everything we build starts with understanding and solving real customer problems.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-dark-50 p-8 rounded-3xl shadow-glow hover-lift border border-primary/20 animate-fade-in delay-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Innovation</h3>
              <p className="text-dark-800 leading-relaxed">
                We continuously improve and innovate to stay ahead in the AI space.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-dark-50 p-8 rounded-3xl shadow-glow hover-lift border border-primary/20 animate-fade-in delay-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Trust & Security</h3>
              <p className="text-dark-800 leading-relaxed">
                Your data security and privacy are our top priorities, always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white">Our Story</h2>
            </div>
            
            <div className="space-y-6 text-lg text-dark-800 leading-relaxed">
              <p>
                AgentDesk was born from a simple observation: businesses of all sizes struggle 
                to provide round-the-clock customer support. Small teams get overwhelmed, 
                customers wait for answers, and businesses lose opportunities.
              </p>
              
              <p>
                We saw the potential of AI to solve this problem, but existing solutions were 
                either too expensive, too complex, or lacked the intelligence needed to truly 
                help customers. So we set out to build something better.
              </p>
              
              <p>
                Today, AgentDesk serves hundreds of businesses worldwide, from solo entrepreneurs 
                to growing enterprises. Our chatbots handle thousands of customer conversations 
                every day, providing instant, accurate support while learning and improving continuously.
              </p>
              
              <p className="text-primary font-semibold">
                We're just getting started, and we're excited to have you join us on this journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-dark-reverse border-t border-primary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Get Started?</h2>
            <p className="text-xl text-dark-800 leading-relaxed">
              Join hundreds of businesses using AgentDesk for smarter customer support.
            </p>
            <Link href="/register?plan=starter">
              <Button size="lg" className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-12 py-7 text-dark font-semibold text-lg group">
                Start Your Free Trial
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

      {/* Chat Widget */}
      <HomeChatWidget />
    </main>
  )
}
