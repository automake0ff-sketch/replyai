// Smoke check de producción. No sustituye a los tests unitarios (esos
// corren en CI antes de merge) — esto corre CONTRA LA URL PÚBLICA REAL
// después del deploy, para pillar justo lo que un test local no ve:
// configuración de Vercel/Supabase, cabeceras mal cacheadas, el sitio
// entero bloqueado por Vercel Authentication, etc. Exactamente las tres
// causas de "el botón de Google no hace nada" de esta semana — ninguna
// de las tres habría aparecido en `npm test` porque son de infraestructura,
// no de código.

const BASE_URL = process.env.SMOKE_CHECK_URL || "https://replyai-seven.vercel.app";

const failures = [];

function fail(check, detail) {
  failures.push(`✗ ${check}: ${detail}`);
}

function ok(check) {
  console.log(`✓ ${check}`);
}

async function checkLoginPageIsPublic() {
  const res = await fetch(`${BASE_URL}/login`, { redirect: "manual" });

  if (res.status !== 200) {
    fail("login accesible", `status ${res.status} (¿Vercel Authentication activada de nuevo?)`);
    return null;
  }
  const html = await res.text();

  if (html.includes("Vercel Authentication") || html.includes("_vercel/insights/auth")) {
    fail("login accesible", "la respuesta parece el muro de Vercel Authentication, no la app");
    return null;
  }
  if (!html.includes("Continuar con Google")) {
    fail("login accesible", "el HTML no contiene el botón de Google — ¿cambió el copy o rompió el render?");
    return null;
  }
  ok("login accesible públicamente (sin Vercel Authentication)");
  return { res, html };
}

function checkNonceMatchesScripts(res, html) {
  const csp = res.headers.get("content-security-policy") || "";
  const nonceMatch = csp.match(/'nonce-([^']+)'/);

  if (!nonceMatch) {
    fail("CSP con nonce", "no se encontró 'nonce-...' en la cabecera Content-Security-Policy");
    return;
  }
  const nonce = nonceMatch[1];

  const cacheStatus = res.headers.get("x-vercel-cache");
  if (cacheStatus === "PRERENDER" || cacheStatus === "HIT") {
    fail(
      "renderizado dinámico",
      `x-vercel-cache: ${cacheStatus} — la página se sirve estática, el nonce del header no coincidirá con los scripts (el bug de esta semana)`
    );
    return;
  }

  const scriptsWithNonce = (html.match(new RegExp(`nonce="${nonce}"`, "g")) || []).length;
  if (scriptsWithNonce === 0) {
    fail(
      "nonce en scripts de hidratación",
      "ningún <script> del HTML lleva el nonce del header CSP — la página no hidratará y ningún botón funcionará"
    );
    return;
  }
  ok(`nonce de CSP coincide con ${scriptsWithNonce} scripts de hidratación`);
}

async function main() {
  console.log(`Smoke check contra ${BASE_URL}\n`);

  const loginCheck = await checkLoginPageIsPublic();
  if (loginCheck) {
    checkNonceMatchesScripts(loginCheck.res, loginCheck.html);
  }

  console.log("");
  if (failures.length > 0) {
    console.error(`${failures.length} comprobación(es) fallida(s):\n`);
    failures.forEach((f) => console.error(f));
    process.exit(1);
  }
  console.log("Todo correcto.");
}

main().catch((err) => {
  console.error("Error ejecutando el smoke check:", err);
  process.exit(1);
});
