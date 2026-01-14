
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Calculator,
  Languages,
  Workflow,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background-light text-text-main font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-9 bg-primary rounded-md flex items-center justify-center text-white">
                <BookOpen className="text-xl" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Aptivo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#courses" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Courses</a>
              <a href="#materials" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Materials</a>
              <a href="#practice" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Practice</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-all">Log in</Link>
            <Link to="/signup" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#34726d] transition-all">Get Started</Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-lg absolute w-full left-0 top-full">
            <nav className="flex flex-col gap-4">
              <a href="#courses" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Courses</a>
              <a href="#materials" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Materials</a>
              <a href="#practice" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Practice</a>
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-all text-center">Log in</Link>
              <Link to="/signup" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#34726d] transition-all text-center">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-32">
          <div className="max-w-[1100px] mx-auto px-6 text-center">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1] font-display">
              Master your future <br />
              with <span className="text-primary">Aptivo</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              The simple, focused aptitude preparation platform designed to help students excel in competitive exams through structured learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup" className="bg-primary text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-[#34726d] transition-all shadow-md">
                Start Learning
              </Link>
              <a href="#tracks" className="text-text-muted px-10 py-4 font-medium hover:text-primary transition-colors flex items-center gap-2">
                View curriculum <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </section>

        {/* Tracks Section */}
        <section id="tracks" className="py-24 bg-slate-50">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 font-display">Preparation Tracks</h2>
              <p className="text-text-muted">Focused modules built for modern exam formats.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {/* Quant */}
              <div className="bg-white p-10 rounded-2xl border border-slate-100 hover:shadow-sm transition-all text-center">
                <div className="size-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calculator size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Quantitative</h3>
                <p className="text-text-muted text-sm leading-relaxed">Systematic approach to numbers, algebra, and logic-based math.</p>
              </div>

              {/* Verbal */}
              <div className="bg-white p-10 rounded-2xl border border-slate-100 hover:shadow-sm transition-all text-center">
                <div className="size-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Languages size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Verbal Ability</h3>
                <p className="text-text-muted text-sm leading-relaxed">Master comprehension and advanced vocabulary for standardized tests.</p>
              </div>

              {/* Logical */}
              <div className="bg-white p-10 rounded-2xl border border-slate-100 hover:shadow-sm transition-all text-center">
                <div className="size-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Workflow size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Logical Reasoning</h3>
                <p className="text-text-muted text-sm leading-relaxed">Develop analytical thinking through pattern recognition and problem sets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Split Section */}
        <section className="py-24">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-20">
              <div className="md:w-1/2">
                <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight font-display">Focus on what <br />actually matters.</h2>
                <p className="text-text-muted text-lg mb-8 leading-relaxed">
                  We've removed the noise. Aptivo provides a clean, distraction-free environment where you can focus solely on your preparation goals.
                </p>
                <ul className="space-y-4">
                  {[
                    'Hand-picked practice problems',
                    'Performance tracking dashboards',
                    'Expert-curated study material'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle size={20} className="text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Abstract Visual Representation */}
              <div className="md:w-1/2 bg-slate-100 rounded-3xl aspect-[4/3] flex items-center justify-center p-12 relative overflow-hidden">
                <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 relative z-10 transition-transform hover:scale-[1.02] duration-500">
                  <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                    <div className="size-2 rounded-full bg-slate-300"></div>
                    <div className="size-2 rounded-full bg-slate-300"></div>
                    <div className="size-2 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse delay-75"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse delay-150"></div>
                    <div className="pt-6 grid grid-cols-2 gap-4">
                      <div className="h-20 bg-primary/5 rounded-lg border border-primary/10"></div>
                      <div className="h-20 bg-primary/5 rounded-lg border border-primary/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="bg-primary rounded-3xl p-16 text-center text-white shadow-2xl shadow-primary/20">
              <h2 className="text-4xl font-bold mb-6 font-display">Ready to start your journey?</h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-light">Join Aptivo today and get access to the most structured aptitude prep platform available.</p>
              <Link to="/signup" className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-lg inline-block">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-12 border-b border-slate-100">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
                  <BookOpen size={16} />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Aptivo</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                The focused aptitude preparation platform for ambitious students. Simple, effective, result-oriented.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h5 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider font-display">Product</h5>
                <ul className="space-y-4 text-sm text-text-muted">
                  <li><a href="#" className="hover:text-primary transition-colors">Courses</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Practice</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Resources</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider font-display">Company</h5>
                <ul className="space-y-4 text-sm text-text-muted">
                  <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider font-display">Social</h5>
                <ul className="space-y-4 text-sm text-text-muted">
                  <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted font-medium">
            <p>© {new Date().getFullYear()} Aptivo. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
