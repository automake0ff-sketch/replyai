import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResponses } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { businessType, reviewText } = await req.json();

  if (!businessType || !reviewText || reviewText.trim().length < 3) {
    return NextResponse.json(
      { error: "Faltan datos: tipo de negocio y texto de la reseña" },
      { status: 400 }
    );
  }

  // Descuento atómico de crédito (o paso libre si el plan es ilimitado)
  const { data: canGenerate, error: creditError } = await supabase.rpc(
    "consume_credit",
    { p_user_id: user.id }
  );

  if (creditError) {
    return NextResponse.json({ error: creditError.message }, { status: 500 });
  }

  if (!canGenerate) {
    return NextResponse.json(
      { error: "Sin créditos disponibles. Actualiza tu plan para continuar." },
      { status: 402 }
    );
  }

  try {
    const responses = await generateResponses(businessType, reviewText);

    await supabase.from("generations").insert({
      user_id: user.id,
      business_type: businessType,
      review_text: reviewText,
      review_sentiment: responses.sentiment,
      responses,
    });

    return NextResponse.json({ responses });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error generando respuestas" },
      { status: 500 }
    );
  }
}
