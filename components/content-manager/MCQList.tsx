import React, { useEffect, useState } from 'react';
import { questionService } from '../../services/questionService';
import { Question } from '../../types';
import { Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MCQList = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await questionService.getAllQuestions();
                setQuestions(data);
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, [refresh]);

    const handleDelete = async (id: string) => {
        if (!user) return;
        if (window.confirm("Are you sure? This will remove the question from the global bank.")) {
            try {
                await questionService.deleteQuestion(id);
                setRefresh(p => p + 1);
            } catch (e: any) {
                alert("Failed to delete question. Ensure you have Super Admin privileges.");
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Question Bank</h2>
                    <p className="text-slate-500 mt-2">Manage multiple choice questions.</p>
                </div>
                <a
                    href="/mcq-uploader/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-lg"
                >
                    <ExternalLink size={18} /> Open MCQ Uploader
                </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Subject / Topic</th>
                            <th className="px-6 py-4 font-semibold">Question</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {questions.map(q => (
                            <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{q.subject}</div>
                                    <div className="text-xs text-slate-500">{q.topic}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 max-w-lg truncate">{q.text}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(q.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {questions.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                                    No questions found. Use the Uploader to add some.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MCQList;
