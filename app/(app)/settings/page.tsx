import { createClient } from "@/lib/supabase/server";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/PlanActions";
import BusinessProfileForm from "@/components/dashboard/BusinessProfileForm";
import ExtensionTokenPanel from "@/components/dashboard/ExtensionTokenPanel";
import AutoToneSelector from "@/components/dashboard/AutoToneSelector";
import ReviewCaptureCard from "@/components/dashboard/ReviewCaptureCard";
import GoogleBusinessProfileCard from "@/components/dashboard/GoogleBusinessProfileCard";
import { isGbpConfigured } from "@/lib/google-business";

const GBP_ERROR_MESSAGES: Record<string, string> = {
  not_configured: "La integración con Google Business Profile aún no está activa.",
  requires_pro: "Conectar Google Business Profile es una función Pro.",
  invalid_state: "La conexión con Google caducó o no es válida. Inténtalo de nuevo.",
  connection_failed: "No se pudo completar la conexión con Google. Inténtalo de nuevo.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { gbp_connected?: string; gbp_error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, email, stripe_customer_id, business_name, brand_voice_notes, auto_tone_positive, review_link, default_business_type")
    .eq("id", user!.id)
    .single();

  const { data: hasToken } = await supabase.rpc("has_api_token");
  const { data: gbpStatusRows } = await supabase.rpc("get_gbp_connection_status");
  const gbpStatus = gbpStatusRows?.[0] as { connected: boolean; location_name: string | null } | undefined;

  const plan = profile?.plan ?? "free";
  const isPro = plan === "pro" || plan === "agency";

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

      {(searchParams.gbp_connected || searchParams.gbp_error) && (
        <div
          className={`mt-6 rounded-xl p-4 font-body text-sm ${
            searchParams.gbp_connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {searchParams.gbp_connected
            ? "Google Business Profile conectado correctamente."
            : GBP_ERROR_MESSAGES[searchParams.gbp_error || ""] || "Ocurrió un error al conectar con Google."}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Google Business Profile <span className="text-clay">— Pro</span>
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Conecta tu ficha de Google para publicar las respuestas directamente, sin copiar y pegar.
        </p>
        {!isGbpConfigured() ? (
          <p className="mt-3 font-body text-sm text-ink/40">Próximamente.</p>
        ) : isPro ? (
          <GoogleBusinessProfileCard
            connected={gbpStatus?.connected ?? false}
            locationName={gbpStatus?.location_name ?? null}
          />
        ) : (
          <div className="mt-3">
            <UpgradeButton plan="pro" label="Desbloquear con Pro — 19€/mes" />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Perfil del negocio
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Se usa automáticamente en tus respuestas generadas — el nombre sobre todo en el tono SEO Local. La voz de marca es una función Pro.
        </p>
        <BusinessProfileForm
          initialName={profile?.business_name || ""}
          initialBrandVoice={profile?.brand_voice_notes || ""}
          initialDefaultType={profile?.default_business_type || ""}
          isPro={isPro}
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
          Extensión de Chrome <span className="text-clay">— Pro</span>
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Genera un token personal para conectar la extensión de ReplyAI y responder reseñas sin salir de Google Business Profile.
        </p>
        {isPro ? (
          <ExtensionTokenPanel hasToken={!!hasToken} />
        ) : (
          <div className="mt-3">
            <UpgradeButton plan="pro" label="Desbloquear con Pro — 19€/mes" />
          </div>
        )}
      </div>
    </div>
  );
}
