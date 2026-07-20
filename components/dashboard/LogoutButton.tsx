"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg px-3 py-2 text-left font-body text-sm text-ink/50 hover:bg-ink/5 hover:text-ink"
    >
      Cerrar sesión
    </button>
  );
}
