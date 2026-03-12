import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center glass-card rounded-3xl border-dashed border-2 border-white/5",
      className
    )}>
      <div className="p-4 rounded-full bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-10 w-10 text-primary opacity-80" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="btn-green h-11 px-8 rounded-xl shadow-lg shadow-primary/20"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
