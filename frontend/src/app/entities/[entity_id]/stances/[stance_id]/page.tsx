import StancePage from "@/components/stance-page/StancePage";

export default async function StanceRoute({ params }: { params: Promise<{ stance_id: string, entity_id: string }> }) {
  const { stance_id, entity_id } = await params;
  return <StancePage entity_id={entity_id} stance_id={stance_id} />;
}
