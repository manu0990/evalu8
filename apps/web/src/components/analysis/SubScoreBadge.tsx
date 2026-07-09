'use client';

interface SubScoreBadgeProps {
  label: string;
  score: number;
}

export function SubScoreBadge({ label, score }: SubScoreBadgeProps) {
  let colorClass = 'bg-green-500/10 text-green-700 border-green-500/20'; // 8-10
  if (score < 4) colorClass = 'bg-red-500/10 text-red-700 border-red-500/20';
  else if (score < 6) colorClass = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  else if (score < 8) colorClass = 'bg-blue-500/10 text-blue-700 border-blue-500/20';

  return (
    <div className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${colorClass}`}>
      <span>{label}:</span>
      <span className="font-bold">{score.toFixed(1)}</span>
    </div>
  );
}
