import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANG_NAMES: Record<string, string> = {
  de: "German",
  en: "English",
  tr: "Turkish",
  uk: "Ukrainian",
  fr: "French",
  ce: "Chechen",
  ar: "Arabic",
};

const InputSchema = z.object({
  title: z.string().default(""),
  content: z.string().default(""),
  links: z
    .array(z.object({ id: z.string(), title: z.string(), url: z.string() }))
    .default([]),
  targets: z.array(z.string()).min(1),
});

type Translated = {
  lang: string;
  title: string;
  content: string;
  links: { id: string; title: string; url: string }[];
};

export const translateSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("app_secrets")
      .select("value")
      .eq("name", "OPENAI_API_KEY")
      .maybeSingle();
    const apiKey = row?.value || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("لم يتم إعداد مفتاح OpenAI في لوحة التحكم");

    async function translateOne(lang: string): Promise<Translated> {
      const targetName = LANG_NAMES[lang] || lang;
      const linksJson = JSON.stringify(data.links.map((l) => ({ id: l.id, title: l.title })));
      const system = `You are a professional translator. Translate from Arabic to ${targetName}. Preserve line breaks. Keep URLs untouched. Reply with ONLY valid JSON matching the schema {"title": string, "content": string, "links": [{"id": string, "title": string}]}. Do not add commentary.`;
      const user = `Arabic title:\n${data.title}\n\nArabic content:\n${data.content}\n\nLinks to translate titles for (keep id exactly, translate title only):\n${linksJson}`;

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 45000);
      let resp: Response;
      try {
        resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });
      } catch (e) {
        clearTimeout(timer);
        throw new Error(`Translation to ${targetName} failed: ${(e as Error).message}`);
      }
      clearTimeout(timer);

      if (!resp.ok) {
        const errorBody = await resp.text();
        console.error(`OpenAI request failed [${resp.status}]: ${errorBody}`);
        throw new Error(`Translation to ${targetName} failed [${resp.status}]: ${errorBody.slice(0, 200)}`);
      }
      const json = await resp.json();
      const raw = json?.choices?.[0]?.message?.content ?? "{}";
      let parsed: { title?: string; content?: string; links?: { id: string; title: string }[] } = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }
      const linkMap = new Map((parsed.links || []).map((l) => [l.id, l.title]));
      return {
        lang,
        title: parsed.title || "",
        content: parsed.content || "",
        links: data.links.map((l) => ({ id: l.id, title: linkMap.get(l.id) || l.title, url: l.url })),
      };
    }

    const results = await Promise.all(data.targets.map(translateOne));
    return { results };
  });
