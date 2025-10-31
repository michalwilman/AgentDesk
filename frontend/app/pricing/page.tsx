import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot, Check, ArrowRight, Linkedin, Github, Instagram } from 'lucide-react'
import HomeChatWidget from '@/components/home/HomeChatWidget'

export default function PricingPage() {
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
            <Link href="/pricing" className="text-primary font-medium">
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
      <section className="bg-gradient-dark py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Simple, Transparent
              <br />
              <span className="text-primary text-glow">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-dark-800 leading-relaxed">
              Choose the perfect plan for your business. Start free, upgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Starter Plan */}
            <div className="bg-dark-50 p-8 rounded-3xl border border-primary/20 shadow-glow hover-lift animate-fade-in delay-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Starter</h3>
                <div className="text-sm text-dark-800 mb-4">Ideal for small businesses focused on enhancing customer satisfaction via live chat support.</div>
                <div className="text-xs text-dark-700 mb-2">Starts at</div>
                <div className="text-5xl font-bold mb-2">
                  <span className="text-primary text-glow">$24.17</span>
                </div>
                <div className="text-dark-800">/mo</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">100 billable conversations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Basic analytics</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Live visitors list</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Operating hours</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">AI Copilot</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">50 AI conversations (one-time)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">100 flow visitors reached</span>
                </li>
              </ul>
              
              <Link href="/register?plan=starter" className="block">
                <Button className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full py-6 text-dark font-semibold">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Growth Plan - Highlighted */}
            <div className="bg-dark-50 p-8 rounded-3xl border-2 border-primary shadow-glow-lg hover-lift animate-fade-in delay-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-cyan text-dark px-6 py-2 rounded-full text-sm font-semibold shadow-glow">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8 mt-4">
                <h3 className="text-2xl font-bold mb-2 text-white">Growth</h3>
                <div className="text-sm text-dark-800 mb-4">Ideal for growing teams looking to boost customer engagement and automation.</div>
                <div className="text-xs text-dark-700 mb-2">Starts at</div>
                <div className="text-5xl font-bold mb-2">
                  <span className="text-primary text-glow">$49.17</span>
                </div>
                <div className="text-dark-800">/mo</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">250 billable conversations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Advanced analytics</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Power features</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">No branding option</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Permissions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">50 AI conversations (one-time)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">100 flow visitors reached</span>
                </li>
              </ul>
              
              <Link href="/checkout?plan=growth" className="block">
                <Button className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full py-6 text-dark font-semibold">
                  Select plan
                </Button>
              </Link>
            </div>

            {/* Plus Plan */}
            <div className="bg-dark-50 p-8 rounded-3xl border border-primary/20 shadow-glow hover-lift animate-fade-in delay-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Plus</h3>
                <div className="text-sm text-dark-800 mb-4">For businesses needing higher limits, advanced tools, integrations & support.</div>
                <div className="text-xs text-dark-700 mb-2">Starts at</div>
                <div className="text-5xl font-bold mb-2">
                  <span className="text-primary text-glow">$749</span>
                </div>
                <div className="text-dark-800">/mo</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Custom billable quota</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Dedicated success manager</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Custom branding</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Multiple projects</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Departments</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Multilanguage</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">OpenAPI</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Live chat human support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">From 300 AI conversations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Custom flow limits</span>
                </li>
              </ul>
              
              <Link href="/checkout?plan=plus" className="block">
                <Button className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full py-6 text-dark font-semibold">
                  Select plan
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-dark-50 p-8 rounded-3xl border border-primary/20 shadow-glow hover-lift animate-fade-in delay-400">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Premium</h3>
                <div className="text-sm text-dark-800 mb-4">Managed AI agent with premium support and advanced features.</div>
                <div className="text-4xl font-bold mb-2 mt-6">
                  <span className="text-primary text-glow">Custom</span>
                </div>
                <div className="text-dark-800">pricing</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Managed AI agent</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">50% resolution guarantee</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Pay per resolution</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Mobile SDK</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Priority support + premium</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Super admin</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Analytics & monitoring</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">From 3000 AI conversations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-dark-800">Expanded flow limits</span>
                </li>
              </ul>
              
              <Link href="/contact" className="block">
                <Button className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full py-6 text-dark font-semibold">
                  Contact Sales
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-dark-reverse">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-dark-50 p-6 rounded-2xl shadow-glow border border-primary/20">
                <h3 className="text-xl font-semibold mb-2 text-white">Can I cancel anytime?</h3>
                <p className="text-dark-800">Yes, you can cancel your subscription at any time. No questions asked, no hidden fees.</p>
              </div>
              
              <div className="bg-dark-50 p-6 rounded-2xl shadow-glow border border-primary/20">
                <h3 className="text-xl font-semibold mb-2 text-white">What payment methods do you accept?</h3>
                <p className="text-dark-800">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
              </div>
              
              <div className="bg-dark-50 p-6 rounded-2xl shadow-glow border border-primary/20">
                <h3 className="text-xl font-semibold mb-2 text-white">Do you offer discounts for annual plans?</h3>
                <p className="text-dark-800">Yes! Save 20% when you choose annual billing. Contact our sales team for custom pricing.</p>
              </div>
              
              <div className="bg-dark-50 p-6 rounded-2xl shadow-glow border border-primary/20">
                <h3 className="text-xl font-semibold mb-2 text-white">What happens after the free trial?</h3>
                <p className="text-dark-800">After your 7-day trial, you can choose to upgrade to a paid plan or continue with limited features.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-dark border-t border-primary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Get Started?</h2>
            <p className="text-xl text-dark-800 leading-relaxed">
              Start your free trial today. No credit card required.
            </p>
            <Link href="/register?plan=starter">
              <Button size="lg" className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-12 py-7 text-dark font-semibold text-lg group">
                Start Free Trial
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
