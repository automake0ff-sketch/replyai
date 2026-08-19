import { createClient } from "@/lib/supabase/server";
import BusinessProfileForm from "@/components/dashboard/BusinessProfileForm";
import AutoToneSelector from "@/components/dashboard/AutoToneSelector";

export default async function NegocioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, business_name, brand_voice_notes, auto_tone_positive, default_business_type")
    .eq("id", user!.id)
    .single();

  const plan = profile?.plan ?? "free";
  const isPro = plan === "pro" || plan === "agency";

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl">Negocio</h1>
      <p className="mt-2 font-body text-sm text-ink/60">
        Esto se usa automáticamente al generar tus respuestas.
      </p>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">
          Perfil del negocio
        </p>
        <p className="mt-1 font-body text-sm text-ink/60">
          El nombre se usa sobre todo en el tono SEO Local. La voz de marca es una función Pro.
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
    </div>
  );
}
