import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/shared/Section";
import { cn } from "cn";

/** Loading placeholder matching the component gallery card's shape
 * (preview image header + title + language chips footer). */
export function ComponentCardSkeleton({ className }: { className?: string }) {
  return (
    <SectionCard
      size="sm"
      className={cn("h-full pb-0", className)}
      header={<Skeleton className="aspect-video w-full rounded-b-none" />}
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="mb-1 h-5 w-24 rounded-md" />
    </SectionCard>
  );
}
