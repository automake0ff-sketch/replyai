import { createClient } from "@/lib/supabase/server";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/PlanActions";
import BusinessNameForm from "@/components/dashboard/BusinessNameForm";
import ExtensionTokenPanel from "@/components/dashboard/ExtensionTokenPanel";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, email, stripe_customer_id, business_name")
    .eq("id", user!.id)
    .single();

  const { data: hasToken } = await supabase.rpc("has_api_token");

  const plan = profile?.plan ?? "free";

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl">Ajustes</h1>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
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

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Nombre del negocio
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Se usará automáticamente en tus respuestas generadas, sobre todo en el tono SEO Local.
        </p>
        <BusinessNameForm initialName={profile?.business_name || ""} />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Extensión de Chrome
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Genera un token personal para conectar la extensión de ReplyAI y responder reseñas sin salir de Google Business Profile.
        </p>
        <ExtensionTokenPanel hasToken={!!hasToken} />
      </div>
    </div>
  );
}
