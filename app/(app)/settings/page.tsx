import { createClient } from "@/lib/supabase/server";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/PlanActions";
import BusinessProfileForm from "@/components/dashboard/BusinessProfileForm";
import ExtensionTokenPanel from "@/components/dashboard/ExtensionTokenPanel";
import AutoToneSelector from "@/components/dashboard/AutoToneSelector";
import ReviewCaptureCard from "@/components/dashboard/ReviewCaptureCard";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, email, stripe_customer_id, business_name, brand_voice_notes, auto_tone_positive, review_link")
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
          Perfil del negocio
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Se usa automáticamente en tus respuestas generadas — el nombre sobre todo en el tono SEO Local, y la voz de marca en todos los tonos.
        </p>
        <BusinessProfileForm
          initialName={profile?.business_name || ""}
          initialBrandVoice={profile?.brand_voice_notes || ""}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Tono automático para reseñas positivas
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          En la extensión de Chrome: si eliges un tono aquí, se usa directamente para reseñas de 4-5 estrellas sin que tengas que elegirlo cada vez. Sigues teniendo que darle a "Generar" y revisar antes de publicar — no publica solo.
        </p>
        <AutoToneSelector initialTone={profile?.auto_tone_positive || ""} />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Captación de reseñas
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Genera un código QR con tu enlace de reseña de Google para imprimir en tu local o compartir por WhatsApp.
        </p>
        <ReviewCaptureCard initialLink={profile?.review_link || ""} />
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
