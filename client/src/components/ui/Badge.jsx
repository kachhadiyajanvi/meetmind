import React from 'react';

const Badge = ({ children, variant = 'default' }) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    warn: 'bg-orange-100 text-orange-800 border border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-100'
  };
  return <span className={`${base} ${variants[variant] || variants.default}`}>{children}</span>;
};

export default Badge;
