"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
          <h1 className="mt-8 font-display text-3xl">Revisa tu email</h1>
          <p className="mt-3 font-body text-sm text-ink/60">
            Si <strong>{email}</strong> tiene una cuenta con nosotros, te hemos enviado un enlace para restablecer tu contraseña.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
        <h1 className="mt-8 font-display text-3xl">Recuperar contraseña</h1>
        <p className="mt-2 font-body text-sm text-ink/60">
          Te mandamos un enlace a tu email para elegir una contraseña nueva.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            placeholder="tu@negocio.com"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="mt-6 font-body text-sm text-ink/60">
          <Link href="/login" className="text-clay underline">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
