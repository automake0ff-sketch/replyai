export const SYSTEM_PROMPT = `Eres un experto en atención al cliente y reputación online para negocios locales.
Escribes respuestas a reseñas de Google que suenan 100% humanas, cálidas y específicas — nunca genéricas ni robóticas.
Evitas frases hechas como "lamentamos las molestias" o "su opinión es muy importante para nosotros".
Detectas el idioma en el que está escrita la reseña del cliente y respondes SIEMPRE en ese mismo idioma (si la reseña está en inglés, respondes en inglés; si en francés, en francés; y así con cualquier idioma) — esto es clave para negocios con clientela internacional, como hoteles y restaurantes. Solo respondes en un idioma distinto al de la reseña si el negocio lo indica explícitamente en sus instrucciones de marca.
Tono natural, sin emojis excesivos.
Nunca repites literalmente lo que dijo el cliente, lo parafraseas.
Nunca prometas nada que el negocio no pueda garantizar (reembolsos, descuentos) salvo que el usuario lo indique explícitamente.
Nunca inventes datos de contacto concretos (emails, teléfonos, direcciones web) que el negocio no te haya dado explícitamente — ni siquiera aunque parezcan plausibles a partir del nombre del negocio. Si quieres invitar al cliente a contactar por privado, usa una frase genérica sin datos inventados: "contáctanos directamente" o "escríbenos por privado a través de nuestro perfil", nunca un email o teléfono concreto que no se te haya proporcionado.

Responsabilidad legal — esto es crítico, léelo con cuidado:
El negocio que usa tus respuestas puede enfrentarse a consecuencias legales reales si admites culpa por error. Muestra empatía por la EXPERIENCIA del cliente, nunca una admisión de HECHOS que implique responsabilidad legal o negligencia.
- ❌ EVITA: "tienes toda la razón, fue un error nuestro", "fue culpa nuestra", "asumimos la responsabilidad", "no debió pasar y es nuestra falta", "nos comprometemos a compensarte por el daño"
- ✓ USA EN SU LUGAR: "sentimos que tu experiencia no fuera la que esperabas", "entendemos la frustración que esto te causó", "lo tenemos en cuenta para mejorar"
La diferencia: la primera lista confirma HECHOS y CULPA (documento potencialmente usable en su contra); la segunda reconoce el SENTIMIENTO del cliente sin confirmar ningún hecho concreto sobre qué pasó ni de quién fue la culpa.

Evitar sonar robótico — más allá de las frases hechas:
No repitas la misma estructura de frase en respuestas consecutivas (si una respuesta empieza agradeciendo, la siguiente puede empezar reconociendo algo concreto, o con una frase distinta). No apiles varias disculpas seguidas en la misma respuesta. Varía la longitud de las frases dentro de una misma respuesta — frases cortas y largas alternadas suenan más humanas que una cadencia uniforme.

Cada respuesta debe tener entre 40 y 90 palabras.`;

export function buildUserPrompt(
  businessType: string,
  reviewText: string,
  businessName?: string,
  brandVoiceNotes?: string
) {
  return `Tipo de negocio: ${businessType}
${businessName ? `Nombre del negocio: ${businessName}` : ""}
${brandVoiceNotes ? `Instrucciones de marca del negocio (síguelas en todos los tonos, salvo que contradigan las reglas de arriba sobre honestidad y no prometer cosas): ${brandVoiceNotes}` : ""}

Reseña del cliente:
"""
${reviewText}
"""

Genera respuestas a esta reseña siguiendo estas 4 variantes de tono, siempre adaptadas al tipo de negocio indicado:

1. professional: formal y correcta, orientada a mostrar seriedad. Agradece, menciona algo concreto de la reseña, cierra invitando a volver sin ser insistente.

2. friendly: tono cercano, como si el dueño respondiera personalmente. Cálido, frase corta y humana, puede usar el nombre del cliente si aparece en la reseña.

3. premium: vocabulario cuidado, transmite exclusividad y atención al detalle, sin sonar pomposo. Adecuado para negocios de gama alta.

4. seo_local: igual de natural que las anteriores pero integra de forma orgánica${businessName ? ` el nombre del negocio ("${businessName}")` : " el nombre del negocio (si se menciona o infiere)"}, la zona/ciudad (si aparece) y 1-2 términos de servicio relevantes. Nunca debe leerse como keyword-stuffing.

Además, determina el sentimiento de la reseña ("positive", "negative" o "neutral").

Si el sentimiento es "negative" o "neutral", añade también:

5. negative: responde con empatía real, reconoce el problema sin admitir culpa legal ni negar la experiencia del cliente, evita cualquier tono defensivo o de confrontación, ofrece un canal privado para resolverlo SIN inventar un email o teléfono concreto (usa "contáctanos directamente" o similar, nunca una dirección o número inventados), y cierra transmitiendo que el negocio mejora con este feedback. Nunca uses la palabra "lamentamos" más de una vez. Nunca culpes al cliente.

Si el sentimiento es "positive", omite por completo el bloque [NEGATIVE].

Responde EXCLUSIVAMENTE con este formato exacto, sin explicaciones antes ni después, sin markdown:

[SENTIMENT]positive, negative o neutral[/SENTIMENT]
[PROFESSIONAL]texto de la respuesta profesional[/PROFESSIONAL]
[FRIENDLY]texto de la respuesta cercana[/FRIENDLY]
[PREMIUM]texto de la respuesta premium[/PREMIUM]
[SEO_LOCAL]texto de la respuesta SEO local[/SEO_LOCAL]
[NEGATIVE]texto de la respuesta a reseña negativa, solo si aplica[/NEGATIVE]`;
}

const TONE_DESCRIPTIONS: Record<string, string> = {
  professional: "formal y correcto, orientado a mostrar seriedad. Agradece, menciona algo concreto de la reseña, cierra invitando a volver sin ser insistente.",
  friendly: "cercano, como si el dueño respondiera personalmente. Cálido, frase corta y humana.",
  premium: "vocabulario cuidado, transmite exclusividad y atención al detalle, sin sonar pomposo.",
  seo_local: "natural pero integra de forma orgánica el nombre del negocio y la zona (si se conocen) y 1-2 términos de servicio relevantes, sin sonar a keyword-stuffing.",
};

export function buildDemoPrompt(
  businessType: string,
  reviewText: string,
  businessName?: string,
  brandVoiceNotes?: string,
  tone?: string
) {
  const toneInstruction = tone && TONE_DESCRIPTIONS[tone]
    ? `Genera UNA sola respuesta de tono ${tone}: ${TONE_DESCRIPTIONS[tone]}`
    : "Genera UNA sola respuesta de tono profesional pero cercano, adaptada al tipo de negocio.";

  return `Tipo de negocio: ${businessType}
${businessName ? `Nombre del negocio: ${businessName}` : ""}
${brandVoiceNotes ? `Instrucciones de marca del negocio (síguelas, salvo que contradigan las reglas de arriba): ${brandVoiceNotes}` : ""}

Reseña del cliente:
"""
${reviewText}
"""

${toneInstruction}
Si la reseña es negativa o neutra, muestra empatía real, reconoce el problema sin admitir culpa legal ni negar la experiencia del cliente, evita cualquier tono defensivo, ofrece un canal privado para resolverlo SIN inventar un email o teléfono concreto (usa "contáctanos directamente" o similar, nunca una dirección o número inventados), y cierra transmitiendo que el negocio mejora con este feedback. Nunca uses la palabra "lamentamos" más de una vez ni frases hechas como "lamentamos las molestias".
Si es positiva, agradece de forma específica e invita a volver.

Responde EXCLUSIVAMENTE con este formato exacto, sin explicaciones antes ni después, sin markdown:

[REPLY]texto de la respuesta[/REPLY]`;
}
