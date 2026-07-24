import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateDemoResponse } from "@/lib/openrouter";

const MAX_DEMOS_PER_IP_PER_DAY = 3;

function getClientIp(req: NextRequest): string {
  // Vercel añade esta cabecera con la IP real del visitante.
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
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

  // Límite por IP: evita que tráfico anónimo agote la cuota diaria
  // del modelo gratuito, compartida con los usuarios registrados.
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
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
