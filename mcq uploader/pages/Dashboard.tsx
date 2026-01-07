import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { Stats } from '../types';
import StatsCard from '../components/StatsCard';
import { Database, PieChart, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await dbService.getStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-textSecondary">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium animate-pulse">Loading dashboard...</p>
      </div>
  );

  const topSubject = stats?.bySubject 
    ? Object.entries(stats.bySubject).sort((a, b) => (b[1] as number) - (a[1] as number))[0] 
    : ['None', 0];

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
        <div className="self-start md:self-auto">
           <span className="text-xs font-bold text-teal-800 bg-primary/20 px-3 py-1.5 rounded-full border border-primary/30 shadow-sm flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
               Live Data
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={item}>
            <StatsCard 
            title="Total Questions" 
            value={stats?.total || 0} 
            icon={<Database className="w-6 h-6" />}
            subtitle="Across all subjects"
            />
        </motion.div>
        <motion.div variants={item}>
            <StatsCard 
            title="Top Subject" 
            value={topSubject[0]} 
            icon={<PieChart className="w-6 h-6" />}
            subtitle={`${topSubject[1]} questions`}
            />
        </motion.div>
        <motion.div variants={item} className="sm:col-span-2 lg:col-span-1">
            <StatsCard 
            title="Weekly Activity" 
            value="+12%" 
            icon={<Activity className="w-6 h-6" />}
            subtitle="Questions added vs last week"
            />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-bold font-heading text-textMain flex items-center gap-2">
                <PieChart className="w-5 h-5 text-teal-600" />
                Subject Distribution
            </h3>
            <button className="text-sm font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors">
                View Details <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden relative z-10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((count as number) / (stats?.total || 1)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                        className="h-full bg-primary rounded-full"
                    />
                 </div>
                 {/* Subtle hover background effect */}
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-gradient-to-br from-primary to-primaryHover p-8 rounded-2xl shadow-xl shadow-primary/10 flex flex-col justify-between relative overflow-hidden border border-primary/20 min-h-[300px]">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 rounded-full bg-teal-900/5 blur-xl"></div>
            
            <div className="relative z-10">
                <h3 className="text-2xl font-bold font-heading mb-2 text-teal-950">Quick Actions</h3>
                <p className="text-teal-900/70 text-sm mb-8 font-medium">Manage your question bank efficiently.</p>
            </div>
            
            <div className="space-y-4 relative z-10">
                <button className="w-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/40 p-3.5 rounded-xl text-left text-sm font-bold text-teal-950 transition-all flex items-center gap-3 shadow-sm hover:shadow-md">
                    <Database className="w-5 h-5 text-teal-900" /> Go to Question Bank
                </button>
                <button className="w-full bg-teal-900 hover:bg-teal-950 p-3.5 rounded-xl text-left text-sm font-bold text-white transition-all flex items-center gap-3 shadow-lg shadow-teal-900/10">
                    <TrendingUp className="w-5 h-5" /> Generate Report
                </button>
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;