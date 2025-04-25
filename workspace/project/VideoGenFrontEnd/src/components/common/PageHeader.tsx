import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h1 className={cn('text-3xl font-bold tracking-tight', className)}>{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
