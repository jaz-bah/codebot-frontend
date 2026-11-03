import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/shared/Section";
import { cn } from "cn";

/** Loading placeholder matching the preset card's shape. */
export function PresetCardSkeleton({ className }: { className?: string }) {
  return (
    <SectionCard
      size="sm"
      className={cn("h-full pb-0", className)}
      title={<Skeleton className="h-4 w-1/3" />}
    >
      <Skeleton className="h-[260px] w-full" />
    </SectionCard>
  );
}
