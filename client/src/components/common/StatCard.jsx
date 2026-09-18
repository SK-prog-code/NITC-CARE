import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  onClick,
}) => {
  const colorGradients = {
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
    amber: 'from-amber-500 to-amber-600 text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    blue: 'from-blue-500 to-blue-600 text-blue-500 bg-blue-50 dark:bg-blue-950/40',
    rose: 'from-rose-500 to-rose-600 text-rose-500 bg-rose-50 dark:bg-rose-950/40',
    purple: 'from-purple-500 to-purple-600 text-purple-500 bg-purple-50 dark:bg-purple-950/40',
  };

  const selectedTheme = colorGradients[color] || colorGradients.indigo;

  return (
    <div
      onClick={onClick}
      className={`glass-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-slate-200/80 dark:border-slate-800 ${
        onClick ? 'cursor-pointer hover:border-brand-400 dark:hover:border-brand-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-3.5 rounded-2xl ${selectedTheme.split(' ').slice(2).join(' ')} shadow-sm`}
          >
            <Icon className={`w-6 h-6 ${selectedTheme.split(' ')[2]}`} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
