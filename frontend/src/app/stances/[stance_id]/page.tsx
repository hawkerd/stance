import StancePage from "@/components/stance-page/StancePage";

export default async function StanceRoute({ params }: { params: Promise<{ stance_id: string }> }) {
  const { stance_id } = await params;
  return <StancePage stance_id={stance_id} />;
}
