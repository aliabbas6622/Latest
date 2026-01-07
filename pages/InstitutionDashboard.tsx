import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockBackend';
import { User, Institution } from '../types';
import { UserPlus, Search, Trash2, Lock, Unlock } from 'lucide-react';

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [instDetails, setInstDetails] = useState<Institution | undefined>(undefined);

  useEffect(() => {
    if (user?.institutionId) {
      setStudents(db.getStudents(user.institutionId));
      setInstDetails(db.getInstitutions().find(i => i.id === user.institutionId));
    }
  }, [user, refresh]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.institutionId) return;
    try {
        await db.createStudent(user.institutionId, newStudentName, newStudentId, user.role);
        setNewStudentName('');
        setNewStudentId('');
        setRefresh(p => p + 1);
    } catch (err: any) {
        alert(err.message);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">{instDetails?.name || 'Institution'} Dashboard</h1>
            <p className="text-slate-500 mt-2">Manage your students and curriculum access.</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium border border-primary-100">
            Domain: @{instDetails?.domain}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Enrolled Students</h2>
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{students.length}</span>
                </div>
                <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Student Name</th>
                                <th className="px-6 py-3 font-semibold">Email (ID)</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{s.name}</td>
                                    <td className="px-6 py-3 text-slate-500">{s.email}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500">No students enrolled yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Create Student Form */}
        <div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <UserPlus size={20} className="text-primary-600" />
                    Add New Student
                </h2>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            required
                            value={newStudentName}
                            onChange={e => setNewStudentName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none"
                            placeholder="Jane Smith"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student ID (Username)</label>
                        <div className="relative">
                            <input 
                                required
                                value={newStudentId}
                                onChange={e => setNewStudentId(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none"
                                placeholder="jsmith24"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Login email will be: <span className="font-mono text-slate-600">{newStudentId || '...' }@{instDetails?.domain}</span>
                        </p>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                            Create Credentials
                        </button>
                    </div>
                </form>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-700">
                    <p className="font-semibold mb-1">Note:</p>
                    Default password for new students is <strong>Student@123</strong>. They will be prompted to change it on first login.
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default InstitutionDashboard;