import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  totalCount?: number;
}

const PaginationControls = ({ page, totalPages, hasNext, hasPrev, onNext, onPrev, totalCount }: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages}
        {totalCount !== undefined && <span className="ml-1">({totalCount} total)</span>}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
          Next <ChevronRight className="h-4 w-4 ml-1 text-black" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
