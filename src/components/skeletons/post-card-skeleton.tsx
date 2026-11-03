import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/shared/Section";
import { cn } from "@/lib/utils";

/** Loading placeholder matching the post card's shape. */
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <SectionCard
      size="sm"
      className={cn("h-full", className)}
      title={<Skeleton className="h-4 w-2/3" />}
      action={<Skeleton className="size-8 rounded-lg" />}
      description={<Skeleton className="h-3 w-24" />}
    >
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </SectionCard>
  );
}
