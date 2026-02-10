import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
}

export const DashboardCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
}: DashboardCardProps) => {
  return (
    <div className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center transition-all hover:shadow-lg">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
        <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
      </div>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <Button
        onClick={onClick}
        className="w-full bg-slate-800 text-white hover:bg-black"
      >
        {buttonText}
      </Button>
    </div>
  );
};
