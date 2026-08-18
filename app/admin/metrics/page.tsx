import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// Acceso restringido por email (ADMIN_EMAILS en las env vars, separados
// por coma) en vez de un rol en base de datos: es un panel de una sola
// persona por ahora, no hace falta el peso de un sistema de roles.
function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

async function getMetrics() {
  const service = createServiceClient();

  const [
    { count: totalUsers },
    { count: freeUsers },
    { count: proUsers },
    { count: agencyUsers },
    { count: freeAtLimit },
    { count: generations7d },
    { count: generations30d },
    { data: recentProfiles },
  ] = await Promise.all([
    service.from("profiles").select("*", { count: "exact", head: true }),
    service.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "free"),
    service.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "pro"),
    service.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "agency"),
    service
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("plan", "free")
      .lte("credits_remaining", 0),
    service
      .from("generations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    service
      .from("generations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    service
      .from("profiles")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString()),
  ]);

  const paidUsers = (proUsers ?? 0) + (agencyUsers ?? 0);
  const conversionRate = totalUsers ? (paidUsers / totalUsers) * 100 : 0;
  const freeAtLimitRate = freeUsers ? ((freeAtLimit ?? 0) / freeUsers) * 100 : 0;

  const signupsByDay: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    signupsByDay[d] = 0;
  }
  (recentProfiles ?? []).forEach((p: { created_at: string }) => {
    const day = (p.created_at as string).slice(0, 10);
    if (day in signupsByDay) signupsByDay[day]++;
  });

  return {
    totalUsers: totalUsers ?? 0,
    freeUsers: freeUsers ?? 0,
    proUsers: proUsers ?? 0,
    agencyUsers: agencyUsers ?? 0,
    freeAtLimit: freeAtLimit ?? 0,
    freeAtLimitRate,
    conversionRate,
    paidUsers,
    generations7d: generations7d ?? 0,
    generations30d: generations30d ?? 0,
    signupsByDay,
  };
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="font-body text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
      {sub && <p className="mt-1 font-body text-xs text-ink/50">{sub}</p>}
    </div>
  );
}

export default async function AdminMetricsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    redirect("/dashboard");
  }

  const m = await getMetrics();
  const maxSignups = Math.max(1, ...Object.values(m.signupsByDay));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl">Métricas</h1>
      <p className="mt-1 font-body text-sm text-ink/50">
        Solo visible para {process.env.ADMIN_EMAILS ? "cuentas admin" : "nadie (falta ADMIN_EMAILS)"}.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Usuarios totales" value={String(m.totalUsers)} />
        <StatCard
          label="Conversión Free → Pago"
          value={`${m.conversionRate.toFixed(1)}%`}
          sub={`${m.paidUsers} de ${m.totalUsers}`}
        />
        <StatCard
          label="Free en el límite"
          value={`${m.freeAtLimitRate.toFixed(1)}%`}
          sub={`${m.freeAtLimit} de ${m.freeUsers} en 0 créditos`}
        />
        <StatCard label="Generaciones (7d)" value={String(m.generations7d)} sub={`${m.generations30d} en 30d`} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="Plan Free" value={String(m.freeUsers)} />
        <StatCard label="Plan Pro" value={String(m.proUsers)} />
        <StatCard label="Plan Agencia" value={String(m.agencyUsers)} />
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-5">
        <p className="font-body text-xs uppercase tracking-wide text-ink/50">Altas — últimos 14 días</p>
        <div className="mt-4 flex items-end gap-1.5" style={{ height: 120 }}>
          {Object.entries(m.signupsByDay).map(([day, count]) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-clay/60"
                style={{ height: `${Math.max(4, (count / maxSignups) * 100)}px` }}
                title={`${day}: ${count}`}
              />
              <span className="font-body text-[9px] text-ink/40">{day.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 font-body text-xs text-ink/40">
        Lectura sugerida: si "Free en el límite" es alto y la conversión es baja, el límite de 5/mes puede
        estar frustrando sin empujar a pagar (bajarlo más no ayudaría). Si es bajo, hay margen para apretar
        más antes de tocar el precio.
      </p>
    </main>
  );
}
