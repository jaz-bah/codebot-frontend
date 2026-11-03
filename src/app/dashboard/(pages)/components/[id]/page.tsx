import { ComponentDetail } from "./component-detail";

/**
 * Client component keyed by id so a route jump between two components
 * remounts with fresh workspace draft state instead of mixing files.
 */
export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComponentDetail key={id} id={id} />;
}
