import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/dashboard/PlanActions";
import ExtensionTokenPanel from "@/components/dashboard/ExtensionTokenPanel";
import ReviewCaptureCard from "@/components/dashboard/ReviewCaptureCard";
import GoogleBusinessProfileCard from "@/components/dashboard/GoogleBusinessProfileCard";
import { isGbpConfigured } from "@/lib/google-business";

const GBP_ERROR_MESSAGES: Record<string, string> = {
  not_configured: "La integración con Google Business Profile aún no está activa.",
  requires_pro: "Conectar Google Business Profile es una función Pro.",
  invalid_state: "La conexión con Google caducó o no es válida. Inténtalo de nuevo.",
  connection_failed: "No se pudo completar la conexión con Google. Inténtalo de nuevo.",
};

export default async function HerramientasPage({
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
    .select("plan, business_name, review_link")
    .eq("id", user!.id)
    .single();

  const { data: hasToken } = await supabase.rpc("has_api_token");
  const { data: gbpStatusRows } = await supabase.rpc("get_gbp_connection_status");
  const gbpStatus = gbpStatusRows?.[0] as { connected: boolean; location_name: string | null } | undefined;

  const plan = profile?.plan ?? "free";
  const isPro = plan === "pro" || plan === "agency";

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl">Herramientas</h1>
      <p className="mt-2 font-body text-sm text-ink/60">
        Todo lo que va más allá de generar una respuesta: conseguir reseñas, publicarlas directamente, y trabajar sin salir de Google.
      </p>

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

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Captación de reseñas
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          Genera un QR (y opcionalmente una tarjeta NFC) con tu enlace de reseña de Google, y un diseño listo para imprimir y poner en tu local.
        </p>
        <ReviewCaptureCard initialLink={profile?.review_link || ""} businessName={profile?.business_name || ""} />
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
    </div>
  );
}
