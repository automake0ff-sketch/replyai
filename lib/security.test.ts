import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { isSameOrigin } from "./security";

function makeRequest(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, { headers });
}

describe("isSameOrigin", () => {
  it("acepta cuando el Origin coincide con el host de la petición", () => {
    const req = makeRequest("https://replyai-seven.vercel.app/api/generate", {
      origin: "https://replyai-seven.vercel.app",
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it("rechaza cuando el Origin es de otro sitio (CSRF real)", () => {
    const req = makeRequest("https://replyai-seven.vercel.app/api/generate", {
      origin: "https://sitio-malicioso.com",
    });
    expect(isSameOrigin(req)).toBe(false);
  });

  it("acepta un despliegue preview de Vercel usando su propio host, sin depender de una env var fija", () => {
    const req = makeRequest("https://replyai-git-feature-x-alejandro.vercel.app/api/generate", {
      origin: "https://replyai-git-feature-x-alejandro.vercel.app",
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it("usa Referer como respaldo si no hay Origin", () => {
    const req = makeRequest("https://replyai-seven.vercel.app/api/generate", {
      referer: "https://replyai-seven.vercel.app/generator",
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it("rechaza si no hay ni Origin ni Referer", () => {
    const req = makeRequest("https://replyai-seven.vercel.app/api/generate");
    expect(isSameOrigin(req)).toBe(false);
  });
});
