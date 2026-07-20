import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 flex-col justify-between border-r border-ink/8 px-5 py-6">
        <div>
          <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
          <nav className="mt-10 flex flex-col gap-1">
            <Link href="/dashboard" className="rounded-lg px-3 py-2 font-body text-sm text-ink/70 hover:bg-ink/5">
              Dashboard
            </Link>
            <Link href="/generator" className="rounded-lg px-3 py-2 font-body text-sm text-ink/70 hover:bg-ink/5">
              Generador
            </Link>
            <Link href="/settings" className="rounded-lg px-3 py-2 font-body text-sm text-ink/70 hover:bg-ink/5">
              Ajustes
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
