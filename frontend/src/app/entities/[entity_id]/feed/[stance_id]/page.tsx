import EntityPage  from "@/components/EntityPage";

export default async function EntityFeedPage({ params }: { params: Promise<{ entity_id: string; stance_id: string }> }) {
  const resolvedParams = await params;
  return (
    <EntityPage
      params={Promise.resolve({ entity_id: resolvedParams.entity_id })}
      feedMode={true}
      initialStanceId={resolvedParams.stance_id}
    />
  );
}
