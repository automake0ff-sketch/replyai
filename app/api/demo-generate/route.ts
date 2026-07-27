import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateDemoResponse } from "@/lib/openrouter";
import { isSameOrigin } from "@/lib/security";

const MAX_DEMOS_PER_IP_PER_DAY = 3;
// Tope global (todas las IPs combinadas): el límite por IP por sí solo no
// protege si el abuso se reparte entre muchas IPs distintas (proxies,
// script que rota IP, o simplemente mucho tráfico legítimo a la vez).
// Este número deja margen para que la demo funcione sin comerse la cuota
// diaria compartida de los modelos gratuitos que también usan los
// usuarios de pago del generador real.
const MAX_DEMOS_GLOBAL_PER_DAY = 30;

function getClientIp(req: NextRequest): string {
  // Vercel añade esta cabecera con la IP real del visitante.
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  let businessType: unknown, reviewText: unknown;
  try {
    ({ businessType, reviewText } = await req.json());
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  if (
    typeof businessType !== "string" ||
    typeof reviewText !== "string" ||
    !businessType.trim() ||
    reviewText.trim().length < 3
  ) {
    return NextResponse.json(
      { error: "Faltan datos: tipo de negocio y texto de la reseña" },
      { status: 400 }
    );
  }

  if (businessType.length > 100 || reviewText.length > 1000) {
    return NextResponse.json(
      { error: "Texto demasiado largo para la demo" },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  const supabase = createServiceClient();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Tope global primero: protege la cuota compartida frente a abuso
  // repartido entre muchas IPs distintas.
  const { count: globalCount } = await supabase
    .from("demo_requests")
    .select("id", { count: "exact", head: true })
    .gte("created_at", oneDayAgo);

  if ((globalCount ?? 0) >= MAX_DEMOS_GLOBAL_PER_DAY) {
    return NextResponse.json(
      {
        error:
          "La demo pública ha alcanzado su límite de uso por hoy. Regístrate para seguir generando respuestas.",
      },
      { status: 429 }
    );
  }

  // Límite por IP: evita que una sola persona/script agote su parte del
  // cupo diario.
  const { count } = await supabase
    .from("demo_requests")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", oneDayAgo);

  if ((count ?? 0) >= MAX_DEMOS_PER_IP_PER_DAY) {
    return NextResponse.json(
      {
        error:
          "Has alcanzado el límite de pruebas gratuitas de hoy. Regístrate para seguir generando respuestas.",
      },
      { status: 429 }
    );
  }

  try {
    const reply = await generateDemoResponse(businessType, reviewText);
    await supabase.from("demo_requests").insert({ ip_address: ip });
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error generando la respuesta" },
      { status: 500 }
    );
  }
}
