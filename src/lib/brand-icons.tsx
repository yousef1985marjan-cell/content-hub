import type { SVGProps } from "react";

export type BrandKey =
  | "facebook"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "whatsapp"
  | "telegram"
  | "snapchat"
  | "linkedin"
  | "android"
  | "apple"
  | "web"
  | "link"
  | "mail"
  | "phone"
  | "chat"
  | "shop"
  | "music"
  | "video"
  | "star"
  | "heart"
  | "news"
  | "map"
  | "camera"
  | "download"
  | "share";

const NEUTRAL = "#64748B";

export const BRAND_META: Record<BrandKey, { label: string; color: string }> = {
  facebook: { label: "Facebook", color: "#1877F2" },
  youtube: { label: "YouTube", color: "#FF0000" },
  tiktok: { label: "TikTok", color: "#000000" },
  instagram: { label: "Instagram", color: "#E4405F" },
  twitter: { label: "X / Twitter", color: "#0F1419" },
  whatsapp: { label: "WhatsApp", color: "#25D366" },
  telegram: { label: "Telegram", color: "#26A5E4" },
  snapchat: { label: "Snapchat", color: "#FFFC00" },
  linkedin: { label: "LinkedIn", color: "#0A66C2" },
  android: { label: "Android", color: "#3DDC84" },
  apple: { label: "iOS", color: "#000000" },
  web: { label: "موقع", color: "#0EA5E9" },
  link: { label: "رابط", color: NEUTRAL },
  mail: { label: "بريد", color: NEUTRAL },
  phone: { label: "هاتف", color: NEUTRAL },
  chat: { label: "محادثة", color: NEUTRAL },
  shop: { label: "متجر", color: NEUTRAL },
  music: { label: "موسيقى", color: NEUTRAL },
  video: { label: "فيديو", color: NEUTRAL },
  star: { label: "نجمة", color: NEUTRAL },
  heart: { label: "قلب", color: NEUTRAL },
  news: { label: "أخبار", color: NEUTRAL },
  map: { label: "خريطة", color: NEUTRAL },
  camera: { label: "كاميرا", color: NEUTRAL },
  download: { label: "تحميل", color: NEUTRAL },
  share: { label: "مشاركة", color: NEUTRAL },
};

export function detectBrand(url?: string): BrandKey | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("t.me") || u.includes("telegram")) return "telegram";
  if (u.includes("snapchat.com")) return "snapchat";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("play.google.com")) return "android";
  if (u.includes("apps.apple.com") || u.includes("itunes.apple.com")) return "apple";
  return null;
}

type P = SVGProps<SVGSVGElement>;

export function BrandIcon({ brand, ...props }: { brand: BrandKey } & P) {
  switch (brand) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.25 10.44 22v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.77l-.44 2.9h-2.33V22C18.34 21.25 22 17.08 22 12.06z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M19.6 6.7a5.9 5.9 0 0 1-3.6-1.2 5.9 5.9 0 0 1-2.3-3.9h-3.3v13.4a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V8.9a6 6 0 1 0 5.3 6V8.5a9.2 9.2 0 0 0 5.8 2v-3.8z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.7 3.7 0 0 1-1.4-.9 3.7 3.7 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 2.2c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1a3.4 3.4 0 0 0-.8-1.3 3.4 3.4 0 0 0-1.3-.8c-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.7a3.9 3.9 0 1 1 0 7.8 3.9 3.9 0 0 1 0-7.8zm0 6.4a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm5-6.6a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0z" />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M17.5 14.3c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5-.7-1.7-1-2.4-.5-.5-.7-.5h-.5a1 1 0 0 0-.8.4c-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1 2.1 3.3 5.2 4.6c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1s1.7-.7 2-1.4c.2-.7.2-1.2.2-1.4s-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M22 3 2 10.5l6.5 2 2.5 7.5 3-4 5.5 4L22 3zm-3.7 4.4-7.2 6.5-.3 3-2.1-2.2 9.6-7.3z" />
        </svg>
      );
    case "snapchat":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12.2 2c3 0 5.5 2 5.7 5.4l.1 3c.4.2.9.3 1.4.3s.9-.3 1.2-.3.7.2.7.6-.6.9-1.6 1.3c-.5.2-.9.3-.9.7 0 .1.1.3.2.6.6 1.3 1.7 2.4 3.4 3.1.2.1.3.3.3.5 0 .8-2 1.4-2.6 1.5-.1.1-.1.2-.2.6-.1.3-.3.5-.6.5-.4 0-1-.3-2.2-.3-1.6 0-2 .3-2.9 1-.8.6-1.6 1.2-3 1.2s-2.2-.6-3-1.2c-1-.6-1.4-1-3-1-1.2 0-1.8.3-2.2.3-.4 0-.5-.3-.6-.5-.1-.3-.1-.5-.2-.5C1.9 18.7 0 18.1 0 17.3c0-.2.1-.4.3-.5 1.7-.7 2.8-1.8 3.4-3.1.1-.3.2-.5.2-.6 0-.4-.4-.5-.9-.7C2 12 1.4 11.5 1.4 11.1s.3-.6.7-.6c.2 0 .6.3 1.2.3s1-.1 1.4-.3l.1-3C4.9 4 7.5 2 10.5 2h1.7z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V9h3v10zM6.5 7.7A1.7 1.7 0 1 1 8.2 6a1.7 1.7 0 0 1-1.7 1.7zM19 19h-3v-5.3c0-1.4-.6-2.1-1.7-2.1-1.2 0-1.8.8-1.8 2.1V19h-3V9h3v1.2A3.3 3.3 0 0 1 15.5 8.8c2.2 0 3.5 1.3 3.5 4V19z" />
        </svg>
      );
    case "android":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M17.5 15.5h-11V9a5.5 5.5 0 0 1 11 0v6.5zM7 5.7l-1.4-2.5a.4.4 0 0 1 .7-.4L7.7 5.3a7.4 7.4 0 0 1 4.3-1.3c1.6 0 3 .5 4.3 1.3L17.7 2.8a.4.4 0 0 1 .7.4L17 5.7a5.5 5.5 0 0 1 2.5 4.6H4.5C4.5 8.4 5.5 6.8 7 5.7zM9 8.5a.7.7 0 1 0 0-1.5.7.7 0 0 0 0 1.5zm6 0a.7.7 0 1 0 0-1.5.7.7 0 0 0 0 1.5zM5 17a1.5 1.5 0 0 1 1.5-1.5H17a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-3 0V20H8v.5a1.5 1.5 0 0 1-3 0V17zm-3-6a1.5 1.5 0 0 1 3 0v5a1.5 1.5 0 0 1-3 0v-5zm17 0a1.5 1.5 0 0 1 3 0v5a1.5 1.5 0 0 1-3 0v-5z" />
        </svg>
      );
    case "apple":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M16.5 12.5c0-2.5 2-3.7 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4a10.5 10.5 0 0 0 1.4-2.9c-.1 0-2.8-1.1-2.8-3.9zm-2.4-7.1a4.4 4.4 0 0 0 1-3.2 4.5 4.5 0 0 0-3 1.5 4.2 4.2 0 0 0-1 3.1 3.8 3.8 0 0 0 3-1.4z" />
        </svg>
      );
    case "web":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
      );
  }
}
