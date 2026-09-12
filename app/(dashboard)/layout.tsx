import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";

// Dashboard selalu tergantung session user — jangan pernah di-static-generate/cache.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppNav />
      <div className="pb-16 md:pb-0 md:pl-56 print:pb-0 print:pl-0">{children}</div>
    </div>
  );
}
