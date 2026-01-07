import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import { Question, StudentAttempt } from '../types';
import { ArrowLeft, AlertOctagon, RefreshCw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentMistakes = () => {
    const { user } = useAuth();
    const [mistakes, setMistakes] = useState<{ attempt: StudentAttempt, question: Question }[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (user) {
                setLoading(true);
                try {
                    const data = await studentService.getMistakes(user.id);
                    setMistakes(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [user]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p>Loading mistakes...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mb-8">
                <Link to="/student/dashboard" className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm mb-4">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <AlertOctagon className="text-red-500" />
                    Mistake Log
                </h1>
                <p className="text-slate-500 mt-2">Review questions you got wrong to improve your accuracy.</p>
            </div>

            {mistakes.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Clean Sheet!</h3>
                    <p>You haven't made any mistakes yet, or haven't attempted any questions.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {mistakes.map(({ attempt, question }) => (
                        <div key={attempt.id} className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

                            <div className="flex justify-between items-start mb-4 pl-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{question.subject} &bull; {question.topic}</span>
                                    <h3 className="font-medium text-slate-900 mt-1">{question.text}</h3>
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {new Date(attempt.timestamp).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="pl-4 grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs font-bold text-red-600 mb-1 uppercase">Your Answer</p>
                                    <p className="text-slate-700">{question.options[attempt.selectedOption]}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-600 mb-1 uppercase">Correct Answer</p>
                                    <p className="text-slate-700">{question.options[question.correctAnswer]}</p>
                                </div>
                            </div>

                            {question.explanation && (
                                <div className="mt-4 pl-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
                                    <span className="font-semibold text-slate-800">Explanation:</span> {question.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default StudentMistakes;