import React, { useState, useEffect } from 'react';
import { StudyMaterial } from '../../types';
import { materialService } from '../../services/materialService';
import { Edit2, Trash2, Search, Filter, FileText, Plus } from 'lucide-react';

interface LearningContentListProps {
    onEdit: (material: StudyMaterial) => void;
    onCreate: () => void;
}

const LearningContentList: React.FC<LearningContentListProps> = ({ onEdit, onCreate }) => {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        loadData();
    }, [refresh]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await materialService.getAllMaterials();
            setMaterials(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this content?")) {
            try {
                await materialService.deleteMaterial(id);
                setRefresh(p => p + 1);
            } catch (e) {
                alert("Failed to delete");
            }
        }
    };

    const filtered = materials.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Learning Content</h1>
                    <p className="text-slate-500 mt-2">Manage study materials, articles, and explanations.</p>
                </div>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
                >
                    <Plus size={20} /> Create New Content
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="text-slate-400" size={20} />
                    <input
                        className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400 py-2"
                        placeholder="Search by title, subject, or topic..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <button className="px-4 py-2 flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20 text-slate-400">Loading materials...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-slate-900 font-bold text-lg mb-2">No content found</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Get started by creating your first study material using the rich markdown editor.</p>
                    <button onClick={onCreate} className="text-primary-600 font-bold hover:underline">Create Content</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map(material => (
                        <div
                            key={material.id}
                            onClick={() => onEdit(material)}
                            className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {material.subject}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                                        {material.topic}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                                    {material.title}
                                </h3>
                                {material.summary && (
                                    <p className="text-slate-500 text-sm line-clamp-2 max-w-2xl">{material.summary}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                <button
                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(material.id, e)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LearningContentList;
