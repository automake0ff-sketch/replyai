import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, credits_remaining, credits_limit")
    .eq("id", user!.id)
    .single();

  const { count: generationsCount } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const plan = profile?.plan ?? "free";
  const isUnlimited = plan === "pro" || plan === "agency";

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 font-body text-sm text-ink/60">
        Bienvenido de nuevo.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
          <p className="font-body text-xs uppercase tracking-wide text-ink/40">
            Créditos disponibles
          </p>
          <p className="mt-2 font-display text-3xl">
            {isUnlimited ? "∞" : profile?.credits_remaining ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
          <p className="font-body text-xs uppercase tracking-wide text-ink/40">
            Respuestas generadas
          </p>
          <p className="mt-2 font-display text-3xl">{generationsCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
          <p className="font-body text-xs uppercase tracking-wide text-ink/40">
            Plan actual
          </p>
          <p className="mt-2 font-display text-3xl capitalize">{plan}</p>
        </div>
      </div>

      <Link href="/generator" className="btn-primary mt-10 inline-flex">
        Generar respuestas →
      </Link>
    </div>
  );
}
