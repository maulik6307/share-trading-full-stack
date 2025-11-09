import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(sizeClasses[size], 'relative flex-shrink-0')}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background with rounded square */}
          <rect width="40" height="40" rx="10" fill="url(#logoGradient)"/>
          
          {/* Trading chart line */}
          <path d="M8 26L13 18L18 24L23 14L28 20L32 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          
          {/* Data points */}
          <circle cx="8" cy="26" r="2" fill="white"/>
          <circle cx="13" cy="18" r="2" fill="white"/>
          <circle cx="18" cy="24" r="2" fill="white"/>
          <circle cx="23" cy="14" r="2" fill="white"/>
          <circle cx="28" cy="20" r="2" fill="white"/>
          <circle cx="32" cy="16" r="2" fill="white"/>
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="50%" stopColor="#6366F1"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          ShareTrading
        </span>
      )}
    </div>
  );
}
