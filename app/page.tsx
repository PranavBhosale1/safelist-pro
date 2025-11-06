'use client';

import Link from 'next/link';
import { motion, LazyMotion, domAnimation, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Zap, BarChart2, FileText, UserIcon, Menu, X, Lock, MessageSquare, TrendingUp, CheckCircle2, Star } from 'lucide-react';
import { useRef, useState } from 'react';
import Image from 'next/image';
import TaxCalculation from "@/components/TaxCalculation";
import { HorizontalFlow } from "@/components/magicui/horizontal-flow";
import { MagicCard } from "@/components/magicui/magic-card";
import { Meteors } from "@/components/magicui/meteors";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import { SparklesText } from "@/components/magicui/sparkles-text";

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Refs for Animated Beam
  const containerRef = useRef<HTMLDivElement>(null);
  const workflowRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const illusY = useTransform(scrollY, [0, 400], [0, 60]);

  const features = [
    {
      image: "/images/security.png",
      name: "Top-Grade Security",
      description: "End-to-end encryption, KYC verification, and escrow protection for every transaction.",
      className: "md:col-span-1",
    },
    {
      image: "/images/speed.png",
      name: "Lightning Fast",
      description: "Trade unlisted shares instantly. No brokers, no delays—just direct peer-to-peer deals.",
      className: "md:col-span-1",
    },
    {
      image: "/images/chat.png",
      name: "Real-Time Chat",
      description: "Secure, encrypted communication with buyers and sellers. Negotiate in real-time.",
      className: "md:col-span-1",
    },
    {
      image: "/images/pricing.png",
      name: "Transparent Pricing",
      description: "No hidden fees. See exactly what you're paying—transparent, fair, and honest.",
      className: "md:col-span-1",
    },
    {
      image: "/images/documents.png",
      name: "Document Management",
      description: "Share and manage documents securely with watermark protection and access controls.",
      className: "md:col-span-1",
    },
    {
      image: "/images/verified.png",
      name: "Verified Companies",
      description: "Only verified Cyber Security companies. Quality over quantity—we ensure legitimacy.",
      className: "md:col-span-1",
    },
  ];

  const workflowSteps = [
    { icon: <UserIcon className="w-10 h-10 text-green-600" />, label: 'Register', desc: 'Create your account in seconds.' },
    { icon: <Shield className="w-10 h-10 text-green-600" />, label: 'Verify', desc: 'Complete KYC verification.' },
    { icon: <BarChart2 className="w-10 h-10 text-green-600" />, label: 'List', desc: 'List your shares or ESOPs.' },
    { icon: <MessageSquare className="w-10 h-10 text-green-600" />, label: 'Chat', desc: 'Connect and negotiate.' },
    { icon: <FileText className="w-10 h-10 text-green-600" />, label: 'Share', desc: 'Share documents securely.' },
    { icon: <CheckCircle2 className="w-10 h-10 text-green-600" />, label: 'Deal', desc: 'Agree on terms.' },
    { icon: <TrendingUp className="w-10 h-10 text-green-600" />, label: 'Settle', desc: 'Complete the trade.' },
  ];

  const testimonials = [
    { text: "Game-changing platform for pre-IPO trading", company: "TechCorp" },
    { text: "Most secure way to trade unlisted shares", company: "SecureInvest" },
    { text: "Transparent, fast, and reliable", company: "EquityHub" },
    { text: "Finally, a platform I trust", company: "InvestNow" },
  ];

  return (
    <LazyMotion features={domAnimation}>
      {/* Notice Banner */}
      <div className="fixed top-0 left-0 w-full z-[60] bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 px-4 shadow-lg">
        <p className="text-sm font-semibold flex items-center justify-center gap-2">
          <Star className="w-4 h-4 animate-pulse" />
          Only Cyber Security companies are available for trade
          <Star className="w-4 h-4 animate-pulse" />
        </p>
      </div>

      {/* Navigation */}
      <nav className="fixed top-10 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-green-200/50 shadow-lg flex items-center justify-between px-6 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            SafeList
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-base font-semibold text-gray-700 hover:text-green-600 transition-colors">
              How it Works
            </a>
            <a href="#features" className="text-base font-semibold text-gray-700 hover:text-green-600 transition-colors">
              Features
            </a>
            <a href="#workflow" className="text-base font-semibold text-gray-700 hover:text-green-600 transition-colors">
              Workflow
            </a>
            <a href="#tax-calculation" className="text-base font-semibold text-gray-700 hover:text-green-600 transition-colors">
              Tax Calculator
            </a>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/signin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white text-green-600 border-2 border-green-600 px-6 py-2 rounded-xl font-bold text-lg hover:bg-green-50 transition-all duration-300"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
        <button
          className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-green-200 shadow-lg flex flex-col gap-4 py-6 md:hidden z-50"
          >
            <a href="#how-it-works" className="px-6 py-2 text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>How it Works</a>
            <a href="#features" className="px-6 py-2 text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#workflow" className="px-6 py-2 text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>Workflow</a>
            <a href="#tax-calculation" className="px-6 py-2 text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>Tax Calculator</a>
            <div className="px-6 flex gap-4">
              <Link href="/auth/signin" className="flex-1">
                <button className="w-full bg-white text-green-600 border-2 border-green-600 px-4 py-2 rounded-xl font-bold">Sign In</button>
              </Link>
              <Link href="/auth/signup" className="flex-1">
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl font-bold">Get Started</button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      <div className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-white text-gray-900 font-sans relative overflow-x-hidden pt-32">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-green-200/20 rounded-full filter blur-3xl animate-blob"
          />
          <motion.div
            className="absolute top-40 right-10 w-96 h-96 bg-green-300/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"
          />
          <motion.div
            className="absolute bottom-20 left-1/2 w-96 h-96 bg-green-100/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"
          />
        </div>

        {/* Hero Section */}
        <section id="how-it-works" ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 gap-12 scroll-mt-24">
          <div className="relative w-full max-w-7xl mx-auto">
            {/* Meteors Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <Meteors number={30} />
            </div>

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Hero Content */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col gap-8 z-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SparklesText text="SafeList" className="text-5xl md:text-7xl" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-black text-gray-900 leading-tight"
                >
                  The Future of{' '}
                  <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Unlisted Equity
                  </span>
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-gray-600 leading-relaxed"
                >
                  Buy & sell <span className="font-semibold text-green-700">unlisted shares</span> and{' '}
                  <span className="font-semibold text-green-700">ESOPs</span> securely, instantly, and transparently.
                  No brokers. No hidden fees. Just peer-to-peer trading.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link href="/auth/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      Get Started Free
                      <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </motion.button>
                  </Link>
                  <Link href="/info/learn">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-white text-green-600 border-2 border-green-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-green-50 transition-all duration-300 shadow-lg"
                    >
                      Learn More
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-6 pt-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Top-Grade Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">KYC Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Zero Hidden Fees</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Hero Image with Magic Card */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ y: illusY }}
                className="relative"
              >
                <MagicCard className="w-full">
                  <div className="relative w-full aspect-square flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-white rounded-3xl border-2 border-green-200 shadow-2xl">
                    <Image 
                      src="/logo2.svg" 
                      alt="SafeList Logo" 
                      width={800} 
                      height={800} 
                      className="w-full h-auto max-w-full"
                      priority
                    />
                  </div>
                </MagicCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Marquee Testimonials */}
        <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-green-200/50">
          <Marquee pauseOnHover className="[--duration:30s]">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="mx-8 flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-50 to-white rounded-2xl border border-green-200 shadow-md">
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">"{testimonial.text}"</p>
                  <p className="text-sm text-gray-500 mt-1">— {testimonial.company}</p>
                </div>
                <Star className="w-5 h-5 text-green-600 fill-green-600" />
              </div>
            ))}
          </Marquee>
        </section>

        {/* Features Section with Bento Grid */}
        <section id="features" className="relative py-24 px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Why Choose <span className="text-green-600">SafeList</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need for secure, transparent, and efficient unlisted equity trading.
              </p>
            </motion.div>

            <BentoGrid className="md:auto-rows-[20rem]">
              {features.map((feature, idx) => (
                <BentoCard
                  key={idx}
                  name={feature.name}
                  description={feature.description}
                  className={feature.className}
                  header={
                    <div className="flex flex-col h-full min-h-[6rem] w-full rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200 p-4 items-center justify-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <Image
                          src={feature.image}
                          alt={feature.name}
                          width={80}
                          height={80}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  }
                />
              ))}
            </BentoGrid>
          </div>
        </section>

        {/* Security Highlight Section */}
        <section id="why-safelist" className="relative py-24 px-6 bg-gradient-to-br from-green-50 to-white scroll-mt-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <MagicCard className="w-full">
                <div className="relative w-full aspect-square bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-12 flex flex-col items-center justify-center shadow-2xl">
                  <Lock className="w-32 h-32 text-white mb-6" />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent rounded-3xl" />
                </div>
              </MagicCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Security <span className="text-green-600">First</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Top-grade encryption, comprehensive KYC verification, and escrow protection for every transaction. 
                Your documents and deals are always protected on SafeList.
              </p>
              <div className="flex flex-col gap-4 mt-4">
                {[
                  "End-to-end encryption for all communications",
                  "Multi-factor authentication",
                  "KYC/AML compliance",
                  "Escrow protection for transactions",
                  "Watermarked document sharing",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Workflow Section with Animated Beam */}
        <section id="workflow" className="relative py-24 px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                How <span className="text-green-600">SafeList</span> Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Seven simple steps to start trading unlisted equity
              </p>
            </motion.div>

            <div className="relative w-full py-12 overflow-x-auto">
              <div ref={containerRef} className="relative min-h-[500px] w-max px-4">
                {/* Horizontal Flow Connectors */}
                <div className="absolute inset-0">
                  {workflowRefs.slice(0, 6).map((ref, idx) => {
                    if (!workflowRefs[idx + 1]) return null;
                    return (
                      <HorizontalFlow
                        key={idx}
                        containerRef={containerRef}
                        fromRef={ref}
                        toRef={workflowRefs[idx + 1]}
                        duration={2}
                        delay={idx * 0.15}
                        gradientStartColor="#16a34a"
                        gradientStopColor="#22c55e"
                        pathWidth={4}
                        pathOpacity={0.6}
                      />
                    );
                  })}
                </div>

                {/* Workflow Steps - Flowing left to right */}
                <div className="relative z-10 flex flex-row items-center flex-nowrap gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                  {workflowSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      ref={workflowRefs[idx]}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="flex flex-col items-center text-center group flex-shrink-0 w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px]"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-white border-4 border-green-600 rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 mb-3 md:mb-4 group-hover:shadow-2xl transition-all duration-300"
                      >
                        {step.icon}
                      </motion.div>
                      <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 mb-1 md:mb-2">{step.label}</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-tight">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Calculation Section */}
        <div id="tax-calculation" className="scroll-mt-32">
          <TaxCalculation />
        </div>

        {/* CTA Section */}
        <section className="relative py-24 px-6 bg-gradient-to-br from-green-600 to-green-700 overflow-hidden">
          <div className="absolute inset-0">
            <Meteors number={20} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Trade Pre-IPO Shares?
            </h2>
            <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
              Join SafeList and experience the future of private equity trading. Secure, transparent, and efficient.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white text-green-600 px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Create Your Account
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/auth/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-transparent text-white border-2 border-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all duration-300"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative py-16 px-6 bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-white text-xl mb-4">SafeList</h4>
                <p className="text-gray-400">
                  Empowering transparent equity exchange for tomorrow's unicorns.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Quick Links</h5>
                <div className="flex flex-col gap-2">
                  <a href="#how-it-works" className="hover:text-green-400 transition-colors">How it Works</a>
                  <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
                  <a href="#workflow" className="hover:text-green-400 transition-colors">Workflow</a>
                  <a href="#tax-calculation" className="hover:text-green-400 transition-colors">Tax Calculator</a>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Get Started</h5>
                <div className="flex flex-col gap-2">
                  <Link href="/auth/signup" className="hover:text-green-400 transition-colors">Register</Link>
                  <Link href="/auth/signin" className="hover:text-green-400 transition-colors">Sign In</Link>
                  <Link href="/info/learn" className="hover:text-green-400 transition-colors">Learn More</Link>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
              © {new Date().getFullYear()} SafeList. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
