import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Zap, Shield, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation */}
      <nav className="fixed w-full border-b border-white/50 bg-white/70 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">APTIVO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-primary-700 font-medium text-sm transition-colors">Sign In</Link>
            <Link
              to="/register-institution"
              className="bg-[#cffdfb] text-primary-950 border border-primary-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#b0fcf9] transition-all shadow-xl shadow-primary-500/10 hover:shadow-primary-500/20"
            >
              Register Institution
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary-50/50 to-transparent rounded-[100%] blur-3xl -z-10" />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Institutional Access Only</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-400">
                Institutional Learning
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Empower your university with a premium, role-based academic platform.
              Engineered for <span className="font-semibold text-slate-900">Understand</span> and <span className="font-semibold text-slate-900">Apply</span> modes.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group flex items-center gap-2 bg-[#cffdfb] text-primary-950 border border-primary-200 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#b0fcf9] hover:border-primary-300 transition-all shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                Login
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Dual Mode Philosophy Section */}
        <section className="py-24 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-sm font-bold text-primary-600 tracking-widest uppercase mb-3">Core Philosophy</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Separation of Concerns</h3>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                We believe learning happens in two distinct states. Our platform strictly separates them to maximize retention and performance.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Understand Mode Card */}
              <motion.div variants={fadeInUp} className="group relative overflow-hidden bg-white rounded-3xl p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-teal-900/5 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={120} className="text-teal-600" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 transition-transform duration-500">
                    <BookOpen size={28} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">Understand Mode</h4>
                  <p className="text-slate-500 font-medium mb-6">Passive Learning & Deep Dive</p>
                  <ul className="space-y-4">
                    {['Distraction-free reading environment', 'No timers, scores, or pressure', 'Conceptual clarity focused'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-teal-500/10 rounded-3xl transition-colors duration-500" />
              </motion.div>

              {/* Apply Mode Card */}
              <motion.div variants={fadeInUp} className="group relative overflow-hidden bg-[#cffdfb] rounded-3xl p-10 shadow-2xl shadow-slate-200/50 hover:shadow-slate-200/60 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap size={120} className="text-primary-800" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center mb-6 text-primary-700 group-hover:rotate-12 transition-transform duration-500">
                    <Zap size={28} />
                  </div>
                  <h4 className="text-2xl font-bold text-primary-950 mb-3">Apply Mode</h4>
                  <p className="text-primary-800 font-medium mb-6">Active Recall & Execution</p>
                  <ul className="space-y-4">
                    {['High-pressure exam simulation', 'Detailed analytics & error logging', 'Speed and accuracy training'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-primary-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  desc: 'Bank-grade data protection with strict role-based access control and domain verification.'
                },
                {
                  icon: Users,
                  title: 'Multi-Tenant Architecture',
                  desc: 'Built for universities to manage thousands of students with isolated data environments.'
                },
                {
                  icon: Globe,
                  title: 'Global Question Bank',
                  desc: 'Access thousands of curated questions across logical reasoning, quant, and verbal ability.'
                }
              ].map((f, i) => (
                <motion.div variants={fadeInUp} key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-slate-900 group-hover:text-primary-600 transition-colors">
                    <f.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto bg-[#cffdfb] rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden"
          >

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-950 mb-6">Ready to transform your campus?</h2>
              <p className="text-lg text-primary-900 max-w-2xl mx-auto mb-10">
                Join forward-thinking institutions using Aptivo to drive student placement success.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register-institution"
                  className="w-full sm:w-auto bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                >
                  Register Institution
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto text-primary-900 border border-primary-300 px-8 py-4 rounded-xl font-bold hover:bg-white/50 transition-colors"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#cffdfb] rounded flex items-center justify-center">
              <span className="text-primary-800 font-bold text-xs">A</span>
            </div>
            <span className="font-bold text-slate-900">APTIVO</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Aptivo Inc. Built for top-tier institutions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
