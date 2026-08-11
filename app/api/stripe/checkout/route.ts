import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS } from "@/lib/stripe";
import { isSameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let plan: unknown;
  try {
    ({ plan } = await req.json());
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  if (plan !== "pro" && plan !== "agency") {
    return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
  }

  if (!PLANS[plan].priceId) {
    return NextResponse.json(
      { error: `Falta configurar el price_id de Stripe para el plan ${plan}` },
      { status: 500 }
    );
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const appUrl = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/settings`,
      metadata: { supabase_user_id: user.id, plan },
      // Muestra un campo de código promocional en la propia página de
      // pago de Stripe. El código y su límite de canjes (ej. 50) se
      // configuran en Stripe Dashboard → Cupones — no hace falta tocar
      // este código para cambiarlos ni para que dejen de funcionar
      // cuando se agoten.
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error en /api/stripe/checkout:", {
      message: err.message,
      type: err.type,
      code: err.code,
      statusCode: err.statusCode,
    });
    return NextResponse.json(
      { error: err.message || "Error creando la sesión de pago" },
      { status: 500 }
    );
  }
}
