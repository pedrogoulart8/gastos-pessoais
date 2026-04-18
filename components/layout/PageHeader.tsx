import { cn } from "@/src/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className, action }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between px-4 pt-6 pb-4", className)}>
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
