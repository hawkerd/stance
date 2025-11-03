import EntityPage from "@/components/entity-page/EntityPage";

interface PageProps {
  params: Promise<{ entity_id: string }>;
}

export default function Page({ params }: PageProps) {
  return <EntityPage params={params} />;
}
