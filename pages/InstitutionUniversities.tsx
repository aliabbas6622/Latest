import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/mockBackend';
import { University } from '../types';
import { useAuth } from '@/context/AuthContext';
import { Lock, Unlock, AlertTriangle, X } from 'lucide-react';

const InstitutionUniversities = () => {
    const { user } = useAuth();
    const [universities, setUniversities] = useState<University[]>([]);
    const [refresh, setRefresh] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUniv, setSelectedUniv] = useState<University | null>(null);

    useEffect(() => {
        setUniversities(db.getUniversities());
    }, [refresh]);

    const initiateToggle = (univ: University) => {
        setSelectedUniv(univ);
        setIsModalOpen(true);
    };

    const confirmToggle = () => {
        if (!user?.institutionId || !selectedUniv) return;
        try {
            db.toggleUniversityLock(user.institutionId, selectedUniv.id, user.role as any);
            setRefresh(p => p + 1);
            closeModal();
        } catch (e: any) {
            alert(e.message);
            closeModal();
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUniv(null);
    };

    const isUnlocked = (univ: University) => {
        return user?.institutionId && univ.unlockedForIds.includes(user.institutionId);
    };

    const isCurrentlyUnlocked = selectedUniv ? isUnlocked(selectedUniv) : false;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Curriculum Management</h1>
                <p className="text-slate-500 mt-2">Unlock universities for your students to access.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold">University Name</th>
                            <th className="px-6 py-4 font-semibold">Location</th>
                            <th className="px-6 py-4 font-semibold text-center">Student Access</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {universities.map(univ => {
                            const unlocked = isUnlocked(univ);
                            return (
                                <tr key={univ.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{univ.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{univ.location}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${unlocked
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {unlocked ? 'Accessible' : 'Locked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => initiateToggle(univ)}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${unlocked
                                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20'
                                                }`}
                                        >
                                            {unlocked ? (
                                                <><Lock size={16} /> Lock Access</>
                                            ) : (
                                                <><Unlock size={16} /> Unlock Access</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && selectedUniv && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 border border-slate-100">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCurrentlyUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {isCurrentlyUnlocked ? 'Lock University Access?' : 'Unlock University Access?'}
                            </h3>

                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {isCurrentlyUnlocked
                                    ? <span>You are about to <strong className="text-red-600">remove access</strong> to <strong>{selectedUniv.name}</strong>. Students will no longer be able to view course materials or take quizzes for this university.</span>
                                    : <span>You are about to <strong className="text-green-700">grant access</strong> to <strong>{selectedUniv.name}</strong>. All enrolled students will immediately be able to access the curriculum.</span>
                                }
                            </p>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmToggle}
                                    className={`px-5 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-95 ${isCurrentlyUnlocked
                                        ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                                        : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
                                        }`}
                                >
                                    {isCurrentlyUnlocked ? 'Yes, Lock Access' : 'Yes, Unlock Access'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default InstitutionUniversities;