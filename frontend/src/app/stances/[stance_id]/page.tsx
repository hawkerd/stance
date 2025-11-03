import StancePage from "@/components/StancePage";

export default function StanceRoute({ params }: { params: Promise<{ stance_id: string }> }) {
  return <StancePage params={params} />;
}
