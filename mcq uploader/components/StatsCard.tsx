import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  colorClass?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, subtitle, colorClass = "bg-white" }) => {
  return (
    <div className={`${colorClass} p-6 rounded-2xl shadow-soft border border-border flex items-start justify-between hover:shadow-hover hover:-translate-y-1 transition-all duration-300 group`}>
      <div>
        <p className="text-sm font-bold text-textSecondary mb-2 uppercase tracking-wide opacity-70">{title}</p>
        <h3 className="text-3xl font-extrabold text-textMain tracking-tight font-heading">{value}</h3>
        {subtitle && <p className="text-xs font-medium text-textSecondary mt-2 flex items-center gap-1">{subtitle}</p>}
      </div>
      <div className="p-3.5 bg-primary/20 rounded-xl text-teal-800 ring-1 ring-primary/30 group-hover:bg-primary/30 transition-colors">
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;