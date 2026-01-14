import React, { useState } from 'react';
import Layout from '../components/Layout';
import LearningContentList from '../components/content-manager/LearningContentList';
import LearningContentEditor from '../components/content-manager/LearningContentEditor';
import MCQList from '../components/content-manager/MCQList';
import { BookOpen, List, FileText } from 'lucide-react';
import { StudyMaterial } from '../types';
import { materialService } from '../services/materialService';

type Tab = 'learning' | 'mcq';
type View = 'list' | 'editor';

const ContentManager = () => {
    const [activeTab, setActiveTab] = useState<Tab>('learning');
    const [view, setView] = useState<View>('list');
    const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);

    const handleCreate = () => {
        setEditingMaterial(null);
        setView('editor');
    };

    const handleEdit = (material: StudyMaterial) => {
        setEditingMaterial(material);
        setView('editor');
    };

    const handleSave = async (data: Partial<StudyMaterial>) => {
        try {
            if (editingMaterial) {
                await materialService.updateMaterial(editingMaterial.id, data);
            } else {
                await materialService.createMaterial(data as any);
            }
            setView('list');
        } catch (e) {
            console.error(e);
            throw e; // Editor handles alert
        }
    };

    return (
        <Layout>
            {/* Tab Navigation (Only show in List view) */}
            {view === 'list' && (
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex gap-1">
                        <button
                            onClick={() => setActiveTab('learning')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'learning'
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <FileText size={18} /> Learning Content
                        </button>
                        <button
                            onClick={() => setActiveTab('mcq')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'mcq'
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <List size={18} /> Question Bank
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {activeTab === 'learning' ? (
                view === 'list' ? (
                    <LearningContentList
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[80vh] border border-slate-100">
                        <LearningContentEditor
                            initialData={editingMaterial}
                            onSave={handleSave}
                            onCancel={() => setView('list')}
                        />
                    </div>
                )
            ) : (
                <MCQList />
            )}
        </Layout>
    );
};

export default ContentManager;
