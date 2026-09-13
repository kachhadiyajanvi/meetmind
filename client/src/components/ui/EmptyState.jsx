import React from 'react';
import { FileText } from 'lucide-react';

const EmptyState = ({ title = 'No items', description = '', cta }) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-slate-500 mb-6">{description}</p>}
      {cta}
    </div>
  );
};

export default EmptyState;
