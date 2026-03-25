import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-white shadow-sm',
    outlined: 'bg-white border border-gray-200',
    filled: 'bg-gray-50',
  };

  return (
    <div className={cn('rounded-xl', variants[variant], className)}>
      {children}
    </div>
  );
}
