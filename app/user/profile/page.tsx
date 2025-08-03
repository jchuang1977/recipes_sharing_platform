import { createSupabaseServerClient } from "../../../src/utils/supabaseServer";
import { ProfileDisplay } from "../../../src/components/auth/ProfileDisplay";
import { notFound } from "next/navigation";

interface UserProfilePageProps {
  searchParams: Promise<{ username?: string }>;
}

export default async function UserProfilePage({ searchParams }: UserProfilePageProps) {
  const { username } = await searchParams;
  
  if (!username) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  // Fetch user profile by username
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_name", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              @{username}&apos;s Profile
            </h1>
          </div>
          
          <ProfileDisplay userId={profile.user_id} showEditButton={false} />
        </div>
      </div>
    </div>
  );
} 