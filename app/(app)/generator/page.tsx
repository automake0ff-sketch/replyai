import { createClient } from "@/lib/supabase/server";
import GeneratorClient from "@/components/generator/GeneratorClient";

export default async function GeneratorPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_business_type")
    .eq("id", user!.id)
    .single();

  return <GeneratorClient defaultBusinessType={profile?.default_business_type || null} />;
}
