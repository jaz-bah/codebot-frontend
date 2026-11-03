import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/shared/Section";
import { cn } from "cn";

/** Loading placeholder matching the todo card's shape. */
export function TodoCardSkeleton({ className }: { className?: string }) {
  return (
    <SectionCard size="sm" className={cn("h-full border-l-4 border-l-muted-foreground/30", className)}>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-7 w-full" />
    </SectionCard>
  );
}
