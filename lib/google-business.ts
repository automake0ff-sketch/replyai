// Cliente para la API de Google Business Profile (antes "Google My
// Business"). Todo esto necesita credenciales OAuth propias que Google
// aprueba manualmente para el scope business.manage — no existen todavía
// (ver GOOGLE_GBP_CLIENT_ID / GOOGLE_GBP_CLIENT_SECRET en .env.example).
// El código de aquí es real y funcional contra la API real; lo único que
// falta es la aprobación de acceso por parte de Google.
//
// Documentación:
// - OAuth: https://developers.google.com/identity/protocols/oauth2/web-server
// - Cuentas/ubicaciones: https://developers.google.com/my-business/reference/accountmanagement/rest
// - Reseñas y respuestas: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews

const GOOGLE_OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GBP_ACCOUNTS_URL = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
const GBP_LOCATIONS_URL = "https://mybusinessbusinessinformation.googleapis.com/v1";
const GBP_REVIEWS_URL_V4 = "https://mybusiness.googleapis.com/v4"; // reviews/reply siguen en v4

const SCOPE = "https://www.googleapis.com/auth/business.manage";

export function isGbpConfigured(): boolean {
  return !!(process.env.GOOGLE_GBP_CLIENT_ID && process.env.GOOGLE_GBP_CLIENT_SECRET);
}

function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://replyai-seven.vercel.app";
  return `${base}/api/gbp/callback`;
}

// Paso 1: URL a la que mandamos al usuario para que autorice en Google.
// `state` debe ser un valor aleatorio guardado en cookie firmada de
// sesión y comprobado en el callback (protección CSRF del flujo OAuth,
// además de la comprobación de same-origin que ya cubre el resto de la
// app — ver lib/security.ts).
export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_GBP_CLIENT_ID || "",
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // necesario para recibir refresh_token
    prompt: "consent", // fuerza a que Google reemita el refresh_token si ya se autorizó antes
    state,
  });
  return `${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

// Paso 2: cambia el `code` del callback por tokens.
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_GBP_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_GBP_CLIENT_SECRET || "",
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google OAuth token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_GBP_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_GBP_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google OAuth refresh failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: "POST",
  });
}

type GbpAccount = { name: string; accountName: string };
type GbpLocation = { name: string; title: string };

// Tras conectar: la cuenta puede tener varias ubicaciones (varias sedes).
// De momento cogemos la primera automáticamente — soportar elegir entre
// varias es trabajo aparte, deliberadamente fuera de este scaffolding.
export async function fetchFirstAccountAndLocation(
  accessToken: string
): Promise<{ accountId: string; locationId: string; locationName: string }> {
  const accountsRes = await fetch(GBP_ACCOUNTS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!accountsRes.ok) throw new Error(`No se pudieron listar las cuentas de Google: ${accountsRes.status}`);
  const { accounts } = (await accountsRes.json()) as { accounts?: GbpAccount[] };
  if (!accounts?.length) throw new Error("La cuenta de Google no tiene ningún negocio en Business Profile.");
  const account = accounts[0];

  const locationsRes = await fetch(
    `${GBP_LOCATIONS_URL}/${account.name}/locations?readMask=name,title`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!locationsRes.ok) throw new Error(`No se pudieron listar las ubicaciones: ${locationsRes.status}`);
  const { locations } = (await locationsRes.json()) as { locations?: GbpLocation[] };
  if (!locations?.length) throw new Error("Esa cuenta de Google no tiene ninguna ubicación configurada.");
  const location = locations[0];

  return {
    accountId: account.name,
    locationId: location.name,
    locationName: location.title,
  };
}

// Publica una respuesta a una reseña de Google directamente — el motivo
// de todo este módulo. accountId/locationId son los `name` completos
// devueltos por fetchFirstAccountAndLocation (p.ej. "accounts/123").
export async function publishReviewReply(
  accessToken: string,
  accountId: string,
  locationId: string,
  reviewId: string,
  replyText: string
): Promise<void> {
  const url = `${GBP_REVIEWS_URL_V4}/${accountId}/${locationId}/reviews/${reviewId}/reply`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: replyText }),
  });
  if (!res.ok) {
    throw new Error(`No se pudo publicar la respuesta en Google: ${res.status} ${await res.text()}`);
  }
}
