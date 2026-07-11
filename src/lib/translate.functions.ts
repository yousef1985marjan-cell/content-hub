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
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const results: Translated[] = [];
    for (const lang of data.targets) {
      const targetName = LANG_NAMES[lang] || lang;
      const linksJson = JSON.stringify(data.links.map((l) => ({ id: l.id, title: l.title })));
      const system = `You are a professional translator. Translate from Arabic to ${targetName}. Preserve line breaks. Keep URLs untouched. Reply with ONLY valid JSON matching the schema {"title": string, "content": string, "links": [{"id": string, "title": string}]}. Do not add commentary.`;
      const user = `Arabic title:\n${data.title}\n\nArabic content:\n${data.content}\n\nLinks to translate titles for (keep id exactly, translate title only):\n${linksJson}`;

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!resp.ok) {
        const errorBody = await resp.text();
        console.error(`Gateway request failed [${resp.status}]: ${errorBody}`);
        throw new Error(`Translation failed [${resp.status}]: ${errorBody}`);
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
      results.push({
        lang,
        title: parsed.title || "",
        content: parsed.content || "",
        links: data.links.map((l) => ({ id: l.id, title: linkMap.get(l.id) || l.title, url: l.url })),
      });
    }
    return { results };
  });
