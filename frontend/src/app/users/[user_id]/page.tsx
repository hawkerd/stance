import ProfilePage from "@/components/user-page/ProfilePage";

export default async function UserProfileRoute({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = await params;
  return <ProfilePage userId={parseInt(user_id)} />;
}
