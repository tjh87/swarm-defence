import React from 'react';

interface AiTagProps {
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  variant?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'blue' | 'gradient';
  showIconOnly?: boolean;
}

export const AiSparkleIcon: React.FC<{ className?: string; useGradient?: boolean }> = ({ 
  className = "w-3.5 h-3.5",
  useGradient = true
}) => {
  const gradientId = React.useId();
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill={useGradient ? `url(#ai-sparkle-blue-${gradientId})` : "currentColor"} 
      className={`shrink-0 ${className}`}
    >
      {useGradient && (
        <defs>
          <linearGradient id={`ai-sparkle-blue-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      )}
      <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" />
    </svg>
  );
};

export const AiTag: React.FC<AiTagProps> = ({ 
  label = "AI POWERED", 
  size = 'xs', 
  className = "",
  variant = 'blue',
  showIconOnly = false
}) => {
  const variantStyles = {
    blue: 'bg-sky-950/80 border-sky-500/40 text-sky-300 shadow-sky-950/50',
    cyan: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 shadow-cyan-950/50',
    purple: 'bg-purple-950/80 border-purple-500/40 text-purple-300 shadow-purple-950/50',
    amber: 'bg-amber-950/80 border-amber-500/40 text-amber-300 shadow-amber-950/50',
    emerald: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-emerald-950/50',
    gradient: 'bg-gradient-to-r from-sky-950/90 via-blue-950/90 to-cyan-950/90 border-sky-400/50 text-sky-200 shadow-sky-950/60',
  };

  const iconColors = {
    blue: 'text-sky-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    gradient: 'text-sky-300',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1 rounded border font-mono tracking-wider font-semibold',
    sm: 'px-2 py-0.5 text-xs gap-1.5 rounded-md border font-mono font-semibold',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg border font-mono font-bold',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  if (showIconOnly) {
    return (
      <span 
        title={label} 
        className={`inline-flex items-center justify-center p-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 shadow-sm ${className}`}
      >
        <AiSparkleIcon className={iconSizes[size]} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center uppercase tracking-wider shadow-sm transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      <AiSparkleIcon className={`${iconColors[variant]} ${iconSizes[size]}`} />
      <span>{label}</span>
    </span>
  );
};

export const AiFeatureBadge: React.FC<{ label?: string; size?: 'xs' | 'sm'; className?: string }> = ({
  label = "AI",
  size = "xs",
  className = ""
}) => {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-950/90 border border-sky-400/60 text-sky-300 font-mono font-extrabold text-[9px] tracking-wide shadow-sm shadow-sky-950/50 ${className}`}>
      <AiSparkleIcon className="w-2.5 h-2.5" />
      <span>{label}</span>
    </span>
  );
};

