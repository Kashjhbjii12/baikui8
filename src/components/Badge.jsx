const colors = {
  pending:        'bg-amber-50 text-amber-700 ring-amber-200/50',
  approved:       'bg-emerald-50 text-emerald-700 ring-emerald-200/50',
  rejected:       'bg-rose-50 text-rose-700 ring-rose-200/50',
  searching:      'bg-blue-50 text-blue-700 ring-blue-200/50',
  negotiating:    'bg-violet-50 text-violet-700 ring-violet-200/50',
  confirmed:      'bg-indigo-50 text-indigo-700 ring-indigo-200/50',
  driver_arrived: 'bg-cyan-50 text-cyan-700 ring-cyan-200/50',
  active:         'bg-emerald-50 text-emerald-700 ring-emerald-200/50',
  completed:      'bg-gray-100 text-gray-700 ring-gray-200/50',
  cancelled:      'bg-rose-50 text-rose-600 ring-rose-200/50',
  online:         'bg-emerald-50 text-emerald-600 ring-emerald-200/50',
  offline:        'bg-gray-50 text-gray-500 ring-gray-200/50',
};

const dotColors = {
  online: 'bg-emerald-500',
  active: 'bg-emerald-500',
  searching: 'bg-blue-500',
  confirmed: 'bg-indigo-500',
  driver_arrived: 'bg-cyan-500',
};

export default function Badge({ status, size = 'sm' }) {
  const cls = colors[status] || 'bg-gray-50 text-gray-600 ring-gray-200/50';
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  const dotCls = dotColors[status];
  return (
    <span className={`inline-flex items-center ${sizes[size]} rounded-full font-medium capitalize ring-1 transition-all ${cls}`}>
      {dotCls && <span className={`w-1.5 h-1.5 ${dotCls} rounded-full mr-1.5 animate-pulse`} />}
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
