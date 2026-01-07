import React, { useState } from 'react';
import { db } from '../services/mockBackend';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const RegisterInstitution = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    officialEmail: '',
    domain: '',
    contactPerson: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        await db.registerInstitution(formData);
        setSuccess(true);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (success) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted</h2>
                <p className="text-slate-600 mb-8">
                    Your institution has been registered successfully. Our Super Admins will review your application. You will receive an email at <strong>{formData.officialEmail}</strong> upon approval.
                </p>
                <Link to="/" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                    Return to Home
                </Link>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900">Register Institution</h2>
                <p className="text-slate-500 mt-2">Join the Aptivo network. Please provide official details.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
                    <input name="name" required onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none" placeholder="e.g. Stanford University" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Official Email</label>
                    <input type="email" name="officialEmail" required onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none" placeholder="admin@stanford.edu" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Requested Domain</label>
                    <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-400">@</span>
                        <input name="domain" required onChange={handleChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none" placeholder="stanford.edu" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                    <input name="contactPerson" required onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none" placeholder="John Doe" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input name="phone" required onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="md:col-span-2 mt-4">
                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50">
                        {loading ? 'Submitting Application...' : 'Submit Registration'}
                    </button>
                    <p className="text-center text-sm text-slate-400 mt-4">By registering, you agree to our Terms of Service.</p>
                </div>
            </form>
        </div>
    </div>
  );
};

export default RegisterInstitution;
