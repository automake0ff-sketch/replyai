import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "@/components/auth/OnboardingForm";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_business_type")
    .eq("id", user.id)
    .single();

  // Si ya completó el onboarding antes, no lo repetimos al volver aquí
  // manualmente.
  if (profile?.default_business_type) redirect("/dashboard");

  return <OnboardingForm />;
}
