import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-md ${className}`} />
);

export default Skeleton;
