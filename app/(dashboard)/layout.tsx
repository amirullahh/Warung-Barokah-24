import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Dashboard selalu tergantung session user — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="min-h-screen bg-neutral-50">{children}</div>;
}
