import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { Stats } from '../../types';
import StatsCard from '../components/StatsCard';
import Skeleton from '../components/Skeleton';
import { Database, PieChart, Activity, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dbService.getStats();
        setStats(data);
        setConnectionStatus('connected');
      } catch (e) {
        console.error(e);
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-soft border border-border h-32">
              <div className="flex justify-between h-full">
                <div className="space-y-3 w-full">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border h-80">
            <div className="flex justify-between mb-8">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-24 rounded-xl" />)}
            </div>
          </div>
          <Skeleton className="h-80 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  const subjectEntries = stats?.bySubject ? Object.entries(stats.bySubject) : [];
  const topSubject = subjectEntries.length > 0
    ? subjectEntries.sort((a, b) => (b[1] as number) - (a[1] as number))[0]
    : ['None', 0];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-textMain tracking-tight">Overview</h2>
          <p className="text-textSecondary mt-2 text-base md:text-lg">Welcome back, here's your activity.</p>
        </div>
        <div className="self-start md:self-auto flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1 ${connectionStatus === 'connected' ? 'text-teal-800 bg-primary/20 border-primary/30' : 'text-red-800 bg-red-100 border-red-200'}`}>
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-teal-500 animate-pulse' : 'bg-red-500'}`}></span>
            {connectionStatus === 'connected' ? 'Supabase Connected' : 'Connection Failed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <StatsCard
            title="Total Questions"
            value={stats?.total || 0}
            icon={<Database className="w-6 h-6" />}
            subtitle="Across all subjects and universities"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Top Active Subject"
            value={topSubject[0]}
            icon={<PieChart className="w-6 h-6" />}
            subtitle={`${topSubject[1]} total questions`}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div variants={item} className="lg:col-span-4 bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-bold font-heading text-textMain flex items-center gap-2">
              <PieChart className="w-5 h-5 text-teal-600" />
              Content Breakdown
            </h3>
            <div className="flex gap-2">
              <button onClick={() => navigate('/bank')} className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors">
                Question Bank
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats?.bySubject || {}).map(([subj, count], idx) => (
              <div key={subj} className="group p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-sm font-semibold text-textSecondary truncate pr-2">{subj}</span>
                  <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-textMain shadow-sm border border-gray-100 flex-shrink-0">
                    {Math.round(((count as number) / (stats?.total || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex items-end gap-2 relative z-10">
                  <span className="text-2xl font-bold text-textMain font-heading">{count}</span>
                  <span className="text-xs text-textSecondary mb-1 font-medium">questions</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden relative z-10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((count as number) / (stats?.total || 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats?.bySubject || {}).length === 0 && (
              <div className="col-span-4 text-center py-10 text-textSecondary italic">
                No data available yet. Add questions to see stats.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;