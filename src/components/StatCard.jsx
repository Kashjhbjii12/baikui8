import { useState } from 'react';

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'ring-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600',
    light: 'bg-indigo-50/50',
    bar: 'bg-indigo-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-200',
    gradient: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50/50',
    bar: 'bg-emerald-100',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'ring-violet-200',
    gradient: 'from-violet-500 to-violet-600',
    light: 'bg-violet-50/50',
    bar: 'bg-violet-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    ring: 'ring-amber-200',
    gradient: 'from-amber-500 to-amber-600',
    light: 'bg-amber-50/50',
    bar: 'bg-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    ring: 'ring-rose-200',
    gradient: 'from-rose-500 to-rose-600',
    light: 'bg-rose-50/50',
    bar: 'bg-rose-100',
  },
};

export default function StatCard({ title, value, icon, color = 'indigo', sub, trend }) {
  const [hovered, setHovered] = useState(false);
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border border-indigo-100/30 transition-all duration-300 cursor-default overflow-hidden
        ${hovered ? 'shadow-xl -translate-y-0.5 border-indigo-200/50' : 'shadow-sm'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] pointer-events-none">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${c.gradient}`} />
      </div>

      <div className="flex items-center justify-between mb-3 relative">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        <span className={`p-2.5 rounded-xl text-lg transition-all duration-300 ${c.bg} ${c.text} ${hovered ? 'scale-110 shadow-sm' : ''}`}>
          {icon}
        </span>
      </div>

      <div className="relative">
        <div className="text-3xl font-bold text-gray-800 tracking-tight">{value ?? '—'}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
              <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
              <span>{Math.abs(trend)}%</span>
            </span>
          )}
          {sub && <span className="text-xs text-gray-400">{sub}</span>}
        </div>
      </div>

      <div className={`absolute bottom-0 left-4 right-4 h-0.5 ${c.bar} rounded-full transition-all duration-300 ${hovered ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50'}`} />
    </div>
  );
}
