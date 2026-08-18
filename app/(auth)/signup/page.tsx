"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Si el proyecto de Supabase tiene activada la confirmación de email
    // (es lo habitual por defecto), signUp NO crea sesión todavía —
    // el usuario debe confirmar desde su correo antes de poder entrar.
    if (!data.session) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  if (confirmationSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
          <h1 className="mt-8 font-display text-3xl">Revisa tu email</h1>
          <p className="mt-3 font-body text-sm text-ink/60">
            Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
            Ábrelo para activar tu cuenta y empezar a usar ReplyAI.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-xl italic">ReplyAI</Link>
        <h1 className="mt-8 font-display text-3xl">Crea tu cuenta</h1>
        <p className="mt-2 font-body text-sm text-ink/60">
          5 respuestas gratis al mes. Sin tarjeta.
        </p>

        <div className="mt-6">
          <GoogleAuthButton />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="font-body text-xs text-ink/40">o con email</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="tu@negocio.com"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Contraseña (mín. 8 caracteres)"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>
        </form>

        <p className="mt-4 font-body text-xs text-ink/40">
          Al crear una cuenta, aceptas nuestros{" "}
          <Link href="/terms" className="underline hover:text-ink/60">Términos</Link>{" "}
          y nuestra{" "}
          <Link href="/privacy" className="underline hover:text-ink/60">Política de Privacidad</Link>.
        </p>

        <p className="mt-6 font-body text-sm text-ink/60">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-clay underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
