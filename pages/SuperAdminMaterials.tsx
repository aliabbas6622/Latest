import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/mockBackend';
import { StudyMaterial } from '../types';
import { Trash2, Plus, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SuperAdminMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Form State
  const [newMat, setNewMat] = useState({
    universityId: 'univ-1',
    subject: 'Quantitative Aptitude',
    topic: '',
    title: '',
    content: '',
    summary: ''
  });

  useEffect(() => {
    setMaterials(db.getAllMaterials());
  }, [refresh]);

  const handleDelete = async (id: string) => {
      if (!user) return;
      if (window.confirm("Delete this study material?")) {
          try {
            await db.deleteMaterial(id, user.role);
            setRefresh(p => p + 1);
          } catch (e: any) {
              alert(e.message);
          }
      }
  };

  const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      try {
        await db.addMaterial(newMat as any, user.role);
        setIsAdding(false);
        setRefresh(p => p + 1);
        setNewMat({ ...newMat, title: '', content: '', summary: '' });
      } catch (e: any) {
          alert(e.message);
      }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Study Materials</h1>
            <p className="text-slate-500 mt-2">Manage "Understand Mode" content.</p>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
        >
            <Plus size={18} /> {isAdding ? 'Cancel' : 'Add Material'}
        </button>
      </div>

      {isAdding && (
          <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
              <h3 className="font-bold text-lg mb-4 text-slate-900">New Study Material</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <input 
                        className="px-4 py-2 border rounded-lg bg-slate-50" 
                        placeholder="Subject"
                        required
                        value={newMat.subject}
                        onChange={e => setNewMat({...newMat, subject: e.target.value})}
                      />
                      <input 
                        className="px-4 py-2 border rounded-lg bg-slate-50" 
                        placeholder="Topic"
                        required
                        value={newMat.topic}
                        onChange={e => setNewMat({...newMat, topic: e.target.value})}
                      />
                  </div>
                  <input 
                    className="w-full px-4 py-2 border rounded-lg bg-slate-50" 
                    placeholder="Title"
                    required
                    value={newMat.title}
                    onChange={e => setNewMat({...newMat, title: e.target.value})}
                  />
                  <textarea 
                    className="w-full px-4 py-2 border rounded-lg bg-slate-50 font-mono text-sm" 
                    placeholder="HTML Content (Explanations, Examples...)"
                    rows={6}
                    required
                    value={newMat.content}
                    onChange={e => setNewMat({...newMat, content: e.target.value})}
                  />
                  <input 
                    className="w-full px-4 py-2 border rounded-lg bg-slate-50" 
                    placeholder="Short Summary / Key Takeaway"
                    value={newMat.summary}
                    onChange={e => setNewMat({...newMat, summary: e.target.value})}
                  />
                  <div className="flex justify-end">
                      <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium">Save Material</button>
                  </div>
              </form>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                      <th className="px-6 py-4 font-semibold">Subject / Topic</th>
                      <th className="px-6 py-4 font-semibold">Title</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {materials.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{m.subject}</div>
                              <div className="text-xs text-slate-500">{m.topic}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{m.title}</td>
                          <td className="px-6 py-4 text-right">
                              <button onClick={() => handleDelete(m.id)} className="text-slate-400 hover:text-red-600">
                                  <Trash2 size={16} />
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </Layout>
  );
};

export default SuperAdminMaterials;