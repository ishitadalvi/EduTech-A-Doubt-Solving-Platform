import React from 'react';

const subjectColorMap = {
  'Computer Science': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Mathematics': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Physics': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Chemistry': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Biology': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Economics': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'General': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const SubjectBadge = ({ subject, size = 'sm' }) => {
  const color = subjectColorMap[subject] || subjectColorMap['General'];
  const sizeClasses = size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${color} ${sizeClasses}`}
    >
      {subject || 'General'}
    </span>
  );
};

export default SubjectBadge;
