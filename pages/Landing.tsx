import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">APTIVO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium text-sm transition-colors">Sign In</Link>
            <Link 
                to="/register-institution" 
                className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
                Register Institution
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                The Future of <span className="text-primary-600">Institutional</span> <br/> Learning Management
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Empower your university with a premium, role-based academic platform. 
                Secure, scalable, and designed for the modern educational ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                    to="/register-institution"
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-all"
                >
                    Get Started <ArrowRight size={18} />
                </Link>
                <Link 
                    to="/login"
                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                    Student Login
                </Link>
            </div>
        </section>

        {/* Features */}
        <section className="bg-slate-50 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        { title: 'Role-Based Access', desc: 'Strict hierarchy for Super Admins, Institutions, and Students.' },
                        { title: 'Domain Security', desc: 'Institutional domain verification ensures only authorized access.' },
                        { title: 'Global Question Bank', desc: 'Centralized, curated content distribution for universities.' }
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-6 text-primary-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Aptivo Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
