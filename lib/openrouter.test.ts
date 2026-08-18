import { describe, it, expect } from "vitest";
import { __test__parseTaggedResponses as parseTaggedResponses } from "./openrouter";

// Estos tests cubren el punto más frágil de la generación: el parseo del
// texto plano que devuelve el modelo. Si un modelo cambia ligeramente el
// formato (falta una etiqueta, sentimiento en mayúsculas, etc.), esto debe
// fallar aquí en CI, no en producción con un usuario real esperando su
// respuesta.

const FULL_RESPONSE = `[SENTIMENT]negative[/SENTIMENT]
[PROFESSIONAL]Texto profesional de prueba.[/PROFESSIONAL]
[FRIENDLY]Texto cercano de prueba.[/FRIENDLY]
[PREMIUM]Texto premium de prueba.[/PREMIUM]
[SEO_LOCAL]Texto SEO local de prueba.[/SEO_LOCAL]
[NEGATIVE]Texto de respuesta a reseña negativa.[/NEGATIVE]`;

describe("parseTaggedResponses", () => {
  it("extrae los 4 tonos base y el sentimiento", () => {
    const result = parseTaggedResponses(FULL_RESPONSE);
    expect(result.professional).toBe("Texto profesional de prueba.");
    expect(result.friendly).toBe("Texto cercano de prueba.");
    expect(result.premium).toBe("Texto premium de prueba.");
    expect(result.seo_local).toBe("Texto SEO local de prueba.");
    expect(result.sentiment).toBe("negative");
  });

  it("incluye el bloque [NEGATIVE] cuando está presente", () => {
    const result = parseTaggedResponses(FULL_RESPONSE);
    expect(result.negative).toBe("Texto de respuesta a reseña negativa.");
  });

  it("omite 'negative' cuando el sentimiento es positivo y no hay bloque", () => {
    const positiveResponse = FULL_RESPONSE
      .replace("[SENTIMENT]negative[/SENTIMENT]", "[SENTIMENT]positive[/SENTIMENT]")
      .replace(/\[NEGATIVE\].*\[\/NEGATIVE\]\n?/, "");
    const result = parseTaggedResponses(positiveResponse);
    expect(result.sentiment).toBe("positive");
    expect(result.negative).toBeUndefined();
  });

  it("cae a 'neutral' (no 'positive') si el modelo devuelve un sentimiento irreconocible", () => {
    const weird = FULL_RESPONSE.replace("[SENTIMENT]negative[/SENTIMENT]", "[SENTIMENT]¯\\_(ツ)_/¯[/SENTIMENT]");
    const result = parseTaggedResponses(weird);
    expect(result.sentiment).toBe("neutral");
  });

  it("lanza si falta una etiqueta obligatoria (formato roto del modelo)", () => {
    const broken = FULL_RESPONSE.replace(/\[PREMIUM\].*\[\/PREMIUM\]\n?/, "");
    expect(() => parseTaggedResponses(broken)).toThrow();
  });

  it("es tolerante a texto extra alrededor de las etiquetas", () => {
    const withPreamble = `Claro, aquí tienes las respuestas:\n\n${FULL_RESPONSE}\n\n¡Espero que te sirvan!`;
    const result = parseTaggedResponses(withPreamble);
    expect(result.professional).toBe("Texto profesional de prueba.");
  });
});
