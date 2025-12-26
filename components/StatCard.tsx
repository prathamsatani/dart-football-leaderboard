import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = "indigo" }) => {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const selectedColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${selectedColor} flex items-center justify-between`}>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-xl font-bold mt-1 text-slate-100">{value}</h3>
        {trend && <p className="text-xs mt-1 opacity-75">{trend}</p>}
      </div>
      <div className={`p-2 rounded-lg bg-opacity-20 bg-white`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;