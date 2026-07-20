import { createClient } from "@/lib/supabase/server";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/PlanActions";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, email, stripe_customer_id")
    .eq("id", user!.id)
    .single();

  const plan = profile?.plan ?? "free";

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl">Ajustes</h1>

      <div className="mt-8 rounded-2xl border border-ink/8 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">Cuenta</p>
        <p className="mt-1 font-body text-sm">{profile?.email}</p>

        <p className="mt-5 font-body text-xs uppercase tracking-wide text-ink/40">
          Plan actual
        </p>
        <p className="mt-1 font-display text-2xl capitalize">{plan}</p>

        <div className="mt-6 flex gap-3">
          {plan === "free" && <UpgradeButton plan="pro" label="Pasar a Pro — 19€/mes" />}
          {profile?.stripe_customer_id && <ManageBillingButton />}
        </div>
      </div>
    </div>
  );
}
