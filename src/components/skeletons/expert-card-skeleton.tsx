import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/shared/Section";
import { cn } from "cn";

/** Loading placeholder matching the expert card's shape. */
export function ExpertCardSkeleton({ className }: { className?: string }) {
  return (
    <SectionCard size="sm" className={cn("h-full", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </SectionCard>
  );
}
