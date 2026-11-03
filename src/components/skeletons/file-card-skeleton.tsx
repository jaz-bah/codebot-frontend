import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/shared/Section";
import { cn } from "cn";

/** Loading placeholder matching the file card's shape. */
export function FileCardSkeleton({ className }: { className?: string }) {
  return (
    <SectionCard
      size="sm"
      className={cn("h-full", className)}
      lead={<Skeleton className="size-9 rounded-lg" />}
      title={<Skeleton className="h-4 w-2/3" />}
      description={<Skeleton className="h-3 w-1/2" />}
      footer={<Skeleton className="h-8 w-full" />}
    />
  );
}
