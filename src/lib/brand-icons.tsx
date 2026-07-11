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
  // generic (line icons, single color, no background box)
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
  | "share"
  | "home"
  | "user"
  | "users"
  | "settings"
  | "bell"
  | "calendar"
  | "clock"
  | "search"
  | "edit"
  | "trash"
  | "plus"
  | "check"
  | "cloud"
  | "folder"
  | "file"
  | "image"
  | "book"
  | "gift"
  | "flag"
  | "tag"
  | "sun"
  | "moon"
  | "lock"
  | "bookmark"
  | "rocket"
  | "coffee"
  | "wifi"
  | "mic"
  | "zap"
  | "trophy"
  | "target"
  | "compass"
  | "wallet"
  | "chart"
  // social media (generic line versions)
  | "facebookAlt"
  | "youtubeAlt"
  | "tiktokAlt"
  | "instagramAlt"
  | "twitterAlt"
  | "whatsappAlt"
  | "telegramAlt"
  | "snapchatAlt"
  | "linkedinAlt"
  | "messenger"
  | "pinterest"
  | "reddit"
  | "discord"
  | "twitch"
  | "spotify"
  | "soundcloud"
  | "vimeo"
  | "tumblr"
  | "github"
  | "medium"
  // app stores & download platforms (branded)
  | "playstore"
  | "appstore"
  | "appgallery"
  | "galaxystore"
  | "amazonAppstore"
  | "microsoftStore"
  | "macAppstore"
  | "steam"
  | "epicgames"
  | "windows"
  | "macos"
  | "linux"
  | "huawei"
  // messengers & communication (branded)
  | "threads"
  | "wechat"
  | "line"
  | "kakao"
  | "viber"
  | "signal"
  | "skype"
  | "zoom"
  | "teams"
  | "slack"
  | "gmail"
  | "outlook"
  // productivity & cloud (branded)
  | "drive"
  | "dropbox"
  | "onedrive"
  | "icloud"
  | "notion"
  | "figma"
  | "behance"
  | "dribbble"
  // streaming & media (branded)
  | "netflix"
  | "shahid"
  | "anghami"
  | "applemusic"
  | "spotifyBrand"
  | "primevideo"
  | "disneyplus"
  // more social (branded)
  // more social (branded)
  | "quora"
  | "mastodon"
  | "bluesky"
  | "threema"
  | "xbox"
  | "playstation"
  // monochrome / line versions of messengers, socials & app stores
  | "threadsAlt"
  | "wechatAlt"
  | "lineAlt"
  | "kakaoAlt"
  | "viberAlt"
  | "signalAlt"
  | "skypeAlt"
  | "zoomAlt"
  | "teamsAlt"
  | "slackAlt"
  | "gmailAlt"
  | "outlookAlt"
  | "quoraAlt"
  | "mastodonAlt"
  | "blueskyAlt"
  | "threemaAlt"
  | "playstoreAlt"
  | "appstoreAlt"
  | "appgalleryAlt"
  | "galaxystoreAlt"
  | "amazonAppstoreAlt"
  | "microsoftStoreAlt"
  | "macAppstoreAlt"
  | "huaweiAlt"
  | "steamAlt"
  | "epicgamesAlt"
  | "xboxAlt"
  | "playstationAlt"
  | "androidAlt"
  | "appleAlt";


const NEUTRAL = "#64748B";

export const GENERIC_BRANDS: BrandKey[] = [
  "link","mail","phone","chat","shop","music","video","star","heart","news",
  "map","camera","download","share","home","user","users","settings","bell","calendar",
  "clock","search","edit","trash","plus","check","cloud","folder","file","image",
  "book","gift","flag","tag","sun","moon","lock","bookmark","rocket","coffee",
  "wifi","mic","zap","trophy","target","compass","wallet","chart",
  // social media (generic line versions)
  "facebookAlt","youtubeAlt","tiktokAlt","instagramAlt","twitterAlt","whatsappAlt","telegramAlt","snapchatAlt","linkedinAlt",
  "messenger","pinterest","reddit","discord","twitch","spotify","soundcloud","vimeo","tumblr","github","medium",
  // monochrome versions of messengers/socials/app stores
  "threadsAlt","wechatAlt","lineAlt","kakaoAlt","viberAlt","signalAlt","skypeAlt","zoomAlt","teamsAlt","slackAlt","gmailAlt","outlookAlt",
  "quoraAlt","mastodonAlt","blueskyAlt","threemaAlt",
  "playstoreAlt","appstoreAlt","appgalleryAlt","galaxystoreAlt","amazonAppstoreAlt","microsoftStoreAlt","macAppstoreAlt","huaweiAlt",
  "steamAlt","epicgamesAlt","xboxAlt","playstationAlt","androidAlt","appleAlt",
];


export function isGeneric(b: BrandKey): boolean {
  return GENERIC_BRANDS.includes(b);
}

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
  home: { label: "الرئيسية", color: NEUTRAL },
  user: { label: "مستخدم", color: NEUTRAL },
  users: { label: "مستخدمون", color: NEUTRAL },
  settings: { label: "إعدادات", color: NEUTRAL },
  bell: { label: "تنبيه", color: NEUTRAL },
  calendar: { label: "تقويم", color: NEUTRAL },
  clock: { label: "ساعة", color: NEUTRAL },
  search: { label: "بحث", color: NEUTRAL },
  edit: { label: "تعديل", color: NEUTRAL },
  trash: { label: "حذف", color: NEUTRAL },
  plus: { label: "إضافة", color: NEUTRAL },
  check: { label: "تم", color: NEUTRAL },
  cloud: { label: "سحابة", color: NEUTRAL },
  folder: { label: "مجلد", color: NEUTRAL },
  file: { label: "ملف", color: NEUTRAL },
  image: { label: "صورة", color: NEUTRAL },
  book: { label: "كتاب", color: NEUTRAL },
  gift: { label: "هدية", color: NEUTRAL },
  flag: { label: "علم", color: NEUTRAL },
  tag: { label: "وسم", color: NEUTRAL },
  sun: { label: "شمس", color: NEUTRAL },
  moon: { label: "قمر", color: NEUTRAL },
  lock: { label: "قفل", color: NEUTRAL },
  bookmark: { label: "علامة", color: NEUTRAL },
  rocket: { label: "صاروخ", color: NEUTRAL },
  coffee: { label: "قهوة", color: NEUTRAL },
  wifi: { label: "واي فاي", color: NEUTRAL },
  mic: { label: "ميكروفون", color: NEUTRAL },
  zap: { label: "طاقة", color: NEUTRAL },
  trophy: { label: "كأس", color: NEUTRAL },
  target: { label: "هدف", color: NEUTRAL },
  compass: { label: "بوصلة", color: NEUTRAL },
  wallet: { label: "محفظة", color: NEUTRAL },
  chart: { label: "رسم بياني", color: NEUTRAL },
  facebookAlt: { label: "فيسبوك", color: NEUTRAL },
  youtubeAlt: { label: "يوتيوب", color: NEUTRAL },
  tiktokAlt: { label: "تيك توك", color: NEUTRAL },
  instagramAlt: { label: "إنستغرام", color: NEUTRAL },
  twitterAlt: { label: "تويتر / إكس", color: NEUTRAL },
  whatsappAlt: { label: "واتساب", color: NEUTRAL },
  telegramAlt: { label: "تلغرام", color: NEUTRAL },
  snapchatAlt: { label: "سناب شات", color: NEUTRAL },
  linkedinAlt: { label: "لينكد إن", color: NEUTRAL },
  messenger: { label: "ماسنجر", color: NEUTRAL },
  pinterest: { label: "بينتيرست", color: NEUTRAL },
  reddit: { label: "ريديت", color: NEUTRAL },
  discord: { label: "ديسكورد", color: NEUTRAL },
  twitch: { label: "تويتش", color: NEUTRAL },
  spotify: { label: "سبوتيفاي", color: NEUTRAL },
  soundcloud: { label: "ساوند كلاود", color: NEUTRAL },
  vimeo: { label: "فيميو", color: NEUTRAL },
  tumblr: { label: "تمبلر", color: NEUTRAL },
  github: { label: "جيت هاب", color: NEUTRAL },
  medium: { label: "ميديوم", color: NEUTRAL },
  // app stores & download
  playstore: { label: "Google Play", color: "#01875F" },
  appstore: { label: "App Store", color: "#0D96F6" },
  appgallery: { label: "AppGallery", color: "#C8102E" },
  galaxystore: { label: "Galaxy Store", color: "#1428A0" },
  amazonAppstore: { label: "Amazon Appstore", color: "#FF9900" },
  microsoftStore: { label: "Microsoft Store", color: "#0078D4" },
  macAppstore: { label: "Mac App Store", color: "#0D96F6" },
  steam: { label: "Steam", color: "#171A21" },
  epicgames: { label: "Epic Games", color: "#2A2A2A" },
  windows: { label: "Windows", color: "#0078D4" },
  macos: { label: "macOS", color: "#000000" },
  linux: { label: "Linux", color: "#000000" },
  huawei: { label: "Huawei", color: "#C8102E" },
  // messengers
  threads: { label: "Threads", color: "#000000" },
  wechat: { label: "WeChat", color: "#07C160" },
  line: { label: "LINE", color: "#00C300" },
  kakao: { label: "KakaoTalk", color: "#FEE500" },
  viber: { label: "Viber", color: "#7360F2" },
  signal: { label: "Signal", color: "#3A76F0" },
  skype: { label: "Skype", color: "#00AFF0" },
  zoom: { label: "Zoom", color: "#2D8CFF" },
  teams: { label: "Teams", color: "#4B53BC" },
  slack: { label: "Slack", color: "#4A154B" },
  gmail: { label: "Gmail", color: "#EA4335" },
  outlook: { label: "Outlook", color: "#0078D4" },
  // productivity & cloud
  drive: { label: "Google Drive", color: "#1FA463" },
  dropbox: { label: "Dropbox", color: "#0061FF" },
  onedrive: { label: "OneDrive", color: "#0078D4" },
  icloud: { label: "iCloud", color: "#3693F3" },
  notion: { label: "Notion", color: "#000000" },
  figma: { label: "Figma", color: "#F24E1E" },
  behance: { label: "Behance", color: "#1769FF" },
  dribbble: { label: "Dribbble", color: "#EA4C89" },
  // streaming
  netflix: { label: "Netflix", color: "#E50914" },
  shahid: { label: "Shahid", color: "#7A00CC" },
  anghami: { label: "Anghami", color: "#4300FF" },
  applemusic: { label: "Apple Music", color: "#FA243C" },
  spotifyBrand: { label: "Spotify", color: "#1DB954" },
  primevideo: { label: "Prime Video", color: "#00A8E1" },
  disneyplus: { label: "Disney+", color: "#113CCF" },
  // more social
  quora: { label: "Quora", color: "#B92B27" },
  mastodon: { label: "Mastodon", color: "#6364FF" },
  bluesky: { label: "Bluesky", color: "#0085FF" },
  threema: { label: "Threema", color: "#3FE669" },
  xbox: { label: "Xbox", color: "#107C10" },
  playstation: { label: "PlayStation", color: "#003791" },
  // monochrome / line versions
  threadsAlt: { label: "Threads (خطي)", color: NEUTRAL },
  wechatAlt: { label: "WeChat (خطي)", color: NEUTRAL },
  lineAlt: { label: "LINE (خطي)", color: NEUTRAL },
  kakaoAlt: { label: "KakaoTalk (خطي)", color: NEUTRAL },
  viberAlt: { label: "Viber (خطي)", color: NEUTRAL },
  signalAlt: { label: "Signal (خطي)", color: NEUTRAL },
  skypeAlt: { label: "Skype (خطي)", color: NEUTRAL },
  zoomAlt: { label: "Zoom (خطي)", color: NEUTRAL },
  teamsAlt: { label: "Teams (خطي)", color: NEUTRAL },
  slackAlt: { label: "Slack (خطي)", color: NEUTRAL },
  gmailAlt: { label: "Gmail (خطي)", color: NEUTRAL },
  outlookAlt: { label: "Outlook (خطي)", color: NEUTRAL },
  quoraAlt: { label: "Quora (خطي)", color: NEUTRAL },
  mastodonAlt: { label: "Mastodon (خطي)", color: NEUTRAL },
  blueskyAlt: { label: "Bluesky (خطي)", color: NEUTRAL },
  threemaAlt: { label: "Threema (خطي)", color: NEUTRAL },
  playstoreAlt: { label: "Google Play (خطي)", color: NEUTRAL },
  appstoreAlt: { label: "App Store (خطي)", color: NEUTRAL },
  appgalleryAlt: { label: "AppGallery (خطي)", color: NEUTRAL },
  galaxystoreAlt: { label: "Galaxy Store (خطي)", color: NEUTRAL },
  amazonAppstoreAlt: { label: "Amazon Appstore (خطي)", color: NEUTRAL },
  microsoftStoreAlt: { label: "Microsoft Store (خطي)", color: NEUTRAL },
  macAppstoreAlt: { label: "Mac App Store (خطي)", color: NEUTRAL },
  huaweiAlt: { label: "Huawei (خطي)", color: NEUTRAL },
  steamAlt: { label: "Steam (خطي)", color: NEUTRAL },
  epicgamesAlt: { label: "Epic Games (خطي)", color: NEUTRAL },
  xboxAlt: { label: "Xbox (خطي)", color: NEUTRAL },
  playstationAlt: { label: "PlayStation (خطي)", color: NEUTRAL },
  androidAlt: { label: "Android (خطي)", color: NEUTRAL },
  appleAlt: { label: "iOS (خطي)", color: NEUTRAL },

};

export function detectBrand(url?: string): BrandKey | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("play.google.com")) return "playstore";
  if (u.includes("apps.apple.com") || u.includes("itunes.apple.com")) return "appstore";
  if (u.includes("appgallery.huawei") || u.includes("consumer.huawei.com/.*/appgallery")) return "appgallery";
  if (u.includes("galaxy.store") || u.includes("galaxystore.samsung")) return "galaxystore";
  if (u.includes("amazon.com/gp/mas") || u.includes("amazon.com/dp/") && u.includes("appstore")) return "amazonAppstore";
  if (u.includes("microsoft.com/store") || u.includes("apps.microsoft")) return "microsoftStore";
  if (u.includes("store.steampowered") || u.includes("steamcommunity")) return "steam";
  if (u.includes("epicgames.com")) return "epicgames";
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("threads.net") || u.includes("threads.com")) return "threads";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("t.me") || u.includes("telegram")) return "telegram";
  if (u.includes("snapchat.com")) return "snapchat";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("m.me") || u.includes("messenger.com")) return "messenger";
  if (u.includes("pinterest.")) return "pinterest";
  if (u.includes("reddit.com")) return "reddit";
  if (u.includes("discord.")) return "discord";
  if (u.includes("twitch.tv")) return "twitch";
  if (u.includes("open.spotify") || u.includes("spotify.com")) return "spotifyBrand";
  if (u.includes("music.apple.com")) return "applemusic";
  if (u.includes("anghami.com")) return "anghami";
  if (u.includes("shahid.")) return "shahid";
  if (u.includes("netflix.com")) return "netflix";
  if (u.includes("primevideo.com") || u.includes("amazon.com/gp/video")) return "primevideo";
  if (u.includes("disneyplus.com")) return "disneyplus";
  if (u.includes("soundcloud.com")) return "soundcloud";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.includes("tumblr.com")) return "tumblr";
  if (u.includes("github.com")) return "github";
  if (u.includes("medium.com")) return "medium";
  if (u.includes("quora.com")) return "quora";
  if (u.includes("bsky.app") || u.includes("bluesky")) return "bluesky";
  if (u.includes("mastodon.")) return "mastodon";
  if (u.includes("wechat") || u.includes("weixin")) return "wechat";
  if (u.includes("line.me")) return "line";
  if (u.includes("kakao")) return "kakao";
  if (u.includes("viber.com")) return "viber";
  if (u.includes("signal.")) return "signal";
  if (u.includes("skype.com")) return "skype";
  if (u.includes("zoom.us") || u.includes("zoom.com")) return "zoom";
  if (u.includes("teams.microsoft") || u.includes("teams.live")) return "teams";
  if (u.includes("slack.com")) return "slack";
  if (u.includes("mail.google") || u.includes("gmail")) return "gmail";
  if (u.includes("outlook.")) return "outlook";
  if (u.includes("drive.google")) return "drive";
  if (u.includes("dropbox.com")) return "dropbox";
  if (u.includes("onedrive")) return "onedrive";
  if (u.includes("icloud.com")) return "icloud";
  if (u.includes("notion.")) return "notion";
  if (u.includes("figma.com")) return "figma";
  if (u.includes("behance.net")) return "behance";
  if (u.includes("dribbble.com")) return "dribbble";
  if (u.includes("xbox.com")) return "xbox";
  if (u.includes("playstation.com")) return "playstation";
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
    case "link":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07L11 5" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07L13 19" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6a1 1 0 0 0-1 .2l-2.2 2.2a15 15 0 0 1-6.6-6.6l2.2-2.2a1 1 0 0 0 .2-1A11 11 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
        </svg>
      );
    case "shop":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18M16 10a4 4 0 1 1-8 0" />
        </svg>
      );
    case "music":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M20 3 8 5.5v10.1A3.5 3.5 0 1 0 10 19V9l10-2v6.6A3.5 3.5 0 1 0 22 17V3z" />
        </svg>
      );
    case "video":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M17 10.5V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3.5l5 3.5V7z" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12 21s-8-4.7-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.3-8 11-8 11z" transform="translate(-1 0)" />
        </svg>
      );
    case "news":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M4 4h14v16H4zM18 8h2v10a2 2 0 0 1-4 0" />
          <path d="M8 8h6M8 12h6M8 16h4" />
        </svg>
      );
    case "map":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M9 3 7 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3l-2-2zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
        </svg>
      );
    case "download":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M12 3v13m0 0-5-5m5 5 5-5M4 21h16" />
        </svg>
      );
    case "share":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      );
    case "home":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 11 9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>;
    case "user":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case "users":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M22 21a7 7 0 0 0-5-6.7"/></svg>;
    case "settings":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "bell":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>;
    case "calendar":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "clock":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    case "search":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case "edit":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>;
    case "trash":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>;
    case "plus":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
    case "check":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>;
    case "cloud":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.8 1A4 4 0 0 0 6 19z"/></svg>;
    case "folder":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
    case "file":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>;
    case "image":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>;
    case "book":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4v16a2 2 0 0 0 2 2h14V2H6a2 2 0 0 0-2 2z"/><path d="M8 2v20"/></svg>;
    case "gift":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="8" width="18" height="4"/><path d="M12 8v14M5 12v10h14V12"/><path d="M12 8s-2-6-5-4 1 4 5 4zm0 0s2-6 5-4-1 4-5 4z"/></svg>;
    case "flag":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 22V4a1 1 0 0 1 1-1h13l-2 5 2 5H5"/></svg>;
    case "tag":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 12 12 20 3 11V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>;
    case "sun":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case "moon":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
    case "lock":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>;
    case "bookmark":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 21-7-5-7 5V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
    case "rocket":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.9.7-2.2-.1-3.1a2.1 2.1 0 0 0-2.9.1z"/><path d="M12 15 9 12c0-4 3-9 10-9 0 7-5 10-9 10z"/><path d="M9 12H5s.5-3 2-4 5 0 5 0M12 15v4s3-.5 4-2 0-5 0-5"/></svg>;
    case "coffee":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v3M10 2v3M14 2v3"/></svg>;
    case "wifi":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 8.8a15 15 0 0 1 20 0M5 12.9a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/></svg>;
    case "mic":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>;
    case "zap":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></svg>;
    case "trophy":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 4h10v5a5 5 0 0 1-10 0zM5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3M8 22h8M12 14v8"/></svg>;
    case "target":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case "compass":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m16 8-6 2-2 6 6-2z"/></svg>;
    case "wallet":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 7v12a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3M17 13h4v4h-4a2 2 0 1 1 0-4z"/></svg>;
    case "chart":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18M7 15l4-4 3 3 5-6"/></svg>;
    // social media generic icons
    case "facebookAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
    case "youtubeAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 8.5a42 42 0 0 0 0 7 2.5 2.5 0 0 1-2 2.5c-1.8.5-9 .5-9 .5s-7.2 0-9-.5a2.5 2.5 0 0 1-2-2.5 42 42 0 0 0 0-7 2.5 2.5 0 0 1 2-2.5c1.8-.5 9-.5 9-.5s7.2 0 9 .5a2.5 2.5 0 0 1 2 2.5z"/><path d="m10 15 5-3-5-3z"/></svg>;
    case "tiktokAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 8a5 5 0 0 1-3-1 5 5 0 0 1-2-3h-3v11a3 3 0 1 1-3-3c.3 0 .5 0 .8.1V8a7 7 0 1 0 6 6.9V8.2a9 9 0 0 0 5 1.8V7.8"/></svg>;
    case "instagramAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1"/></svg>;
    case "twitterAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "whatsappAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2z"/><path d="M9 12c1.7 3 4 3 5 3s3-1 3-2-1.5-1.5-2.5-1.5-1.5.5-2.5 1.5c-1 1-2 1-2.5 1s-.5-1.5.5-2.5"/></svg>;
    case "telegramAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 3 2 10.5l6.5 2 2.5 7.5 3-4 5.5 4L21 3z"/><path d="M17 7 7.5 13.5"/></svg>;
    case "snapchatAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a7 7 0 0 0-7 7c0 4 2 5 3 6s1 2 2 3 1 2 2 2 1.5 0 2-1 1-2 2-3 3-2 3-6a7 7 0 0 0-7-7z"/><path d="M9 8h6M9 11h6"/></svg>;
    case "linkedinAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 8v8M8 11v5M8 8a2 2 0 1 0 0-1"/><path d="M16 11v5M16 8v2a2 2 0 0 1-2 2"/></svg>;
    case "messenger":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a10 10 0 0 0-9 13.5L2 22l5.5-1.5A10 10 0 1 0 12 2z"/><path d="m8 14 4-4 3 3 3-3"/></svg>;
    case "pinterest":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="9"/><path d="M10 8c2 0 4 1 4 4 0 2-1 4-2 5l-1 5-1-5c-1 1-3 0-3-2 0-3 2-5 4-5z"/></svg>;
    case "reddit":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="9"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/><path d="M7 12c1 2 5 2 5 2s4 0 5-2"/><path d="M16 5l1 2M8 5 7 7"/></svg>;
    case "discord":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 5A11 11 0 0 0 3 17a11 11 0 0 0 4-2c.5.3 1.5 1 2.5 1s2-.7 2.5-1c.5.3 1.5 1 2.5 1s2-.7 2.5-1a11 11 0 0 0 4 2A11 11 0 0 0 17 5c-1-1-2-1.5-3-2"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/></svg>;
    case "twitch":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 3v13h4l2 3 2-3h4l3-4V3H4z"/><path d="M12 7v4M16 7v4"/></svg>;
    case "spotify":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="9"/><path d="M7 10c4-1 8-1 10 1"/><path d="M7 14c3-1 6-1 8 1"/></svg>;
    case "soundcloud":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 15v4M7 12v7M10 10v9M13 7v12M16 4v15c3 0 5-2 5-5s-2-5-5-5z"/></svg>;
    case "vimeo":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 3s-3 0-5 3-2 5-2 5 1-3 3-3 3 2 3 5-2 6-5 6-5-2-7-5S4 4 8 4s5 3 5 3z"/></svg>;
    case "tumblr":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 4h6v5h4v4h-4v4c0 3 2 4 4 4v4c-5 0-8-2-8-7V9H6V4z"/></svg>;
    case "github":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.8-1.6 6.8-7.5 0-1.5-.5-2.7-1.4-3.7.4-1 .4-2.2 0-3.3 0 0-1.1-.3-3.4 1.3a11.8 11.8 0 0 0-6.2 0C5.3 1.7 4.2 2 4.2 2c-.4 1.1-.4 2.3 0 3.3-.9 1-1.4 2.3-1.4 3.7 0 5.9 3.5 7.1 6.8 7.5a3.4 3.4 0 0 0-1 2.6V22"/></svg>;
    case "medium":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="6" cy="12" r="4"/><path d="M13 8h6v8h-6M13 12h6"/></svg>;
    // app stores & download platforms
    case "playstore":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3.6 2.3c-.4.3-.6.8-.6 1.5v16.4c0 .7.2 1.2.6 1.5l9.2-9.7L3.6 2.3zm10.3 10.4 2.6 2.7-11.1 6.3 8.5-9zm4.8-4.1 2.6 1.5c1 .6 1 1.6 0 2.2l-2.7 1.5-3-3 3.1-2.2zm-4.8-.4-8.5-9 11.1 6.3-2.6 2.7z"/></svg>;
    case "appstore":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.7 6.4L11.4 10 9 14.2h2.5l.9 1.5H7l1.8-3.1 1.5-2.7-.5-.9 1.1-.6zm4.7 7.2h-1.4l-.7-1.1L11 10l1.1-.6.9 1.5 1.7 3v.1h.9v1.6zM8.4 17H7c-.2 0-.4-.1-.4-.4l.6-1h1.5l-.6 1c-.1.3-.4.4-.7.4z"/></svg>;
    case "appgallery":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm3 5v4a3 3 0 0 0 6 0V8h-1.5v4a1.5 1.5 0 0 1-3 0V8H9z"/></svg>;
    case "galaxystore":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6c2 0 4 1 4 3h-2c0-.5-.9-1-2-1s-2 .3-2 1c0 .6.7.8 2.3 1.1 1.5.3 3.7.8 3.7 3.1 0 2-2 3-4 3s-4-1-4-3h2c0 .7 1 1 2 1s2-.3 2-1c0-.6-.9-.8-2.3-1.1C10.2 13.8 8 13.3 8 11c0-2 2-3 4-3z"/></svg>;
    case "amazonAppstore":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14.5 12.6a5 5 0 0 1-3 1c-1.5 0-2.8-.7-2.8-2 0-1.2 1-2 3-2.2l1.8-.2v-.4c0-.7-.4-1-1.2-1s-1.3.3-1.5.9l-1.8-.4C8.5 7 9.7 6.3 11.4 6.3c2 0 3.1.9 3.1 2.7v4.1c0 .3 0 .5.2.7l-.2.8zm-.5-2.4v-.5l-1.5.2c-1 .1-1.5.5-1.5 1s.5.9 1.3.9c.7 0 1.3-.3 1.7-.7v-.9zM3 16.5c4.8 2.7 10.8 2.6 15.7-.2.2-.1.4.1.2.3-1.8 1.7-5 2.7-8.1 2.7-3.5 0-6.6-1.2-8.1-2.4-.1-.1 0-.4.3-.4zm17.2-.9c-.4-.5-2.7-.2-3.7 0-.3.1-.3-.2-.1-.4 1.8-1.2 4.8-.9 5.1-.5.4.4-.1 3.3-1.8 4.7-.3.2-.5.1-.4-.2.4-.9 1.2-3 .9-3.6z"/></svg>;
    case "microsoftStore":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3 3h9v9H3zM12 3h9v9h-9zM3 12h9v9H3zM12 12h9v9h-9z"/></svg>;
    case "macAppstore":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-3.2 12.5c-.4.7-1 .9-1.5.6l-.5-.3c-.4-.3-.5-.9-.1-1.4l3-4.9-1-1.6c-.3-.5 0-1 .5-1s.7.3.9.6l.5.9.5-.9c.2-.3.4-.6.9-.6.5 0 .7.5.5 1l-4.7 7.6zm7.8 1.3h-.6c-.3 0-.5-.1-.7-.4l-.7-1.2H9l-.5.9h-2l4.4-7.4 1.2 2.1 2.6 4.4c.2.4.1.9-.4 1.2l-.7.4z"/></svg>;
    case "steam":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 0 0-10 9.6l5.3 2.2a2.8 2.8 0 0 1 3.5-.4l2.4-3.5v-.1a3.8 3.8 0 1 1 3.8 3.8h-.1l-3.4 2.5a2.8 2.8 0 0 1-5.4 1.1l-3.8-1.6A10 10 0 1 0 12 2zm-4.7 15.2-1.2-.5a2.1 2.1 0 1 0 2.5-3l1.2.5a1.6 1.6 0 1 1-2.5 3zm11.2-5.7a2.5 2.5 0 1 0-2.5-2.5c0 1.4 1.1 2.5 2.5 2.5z"/></svg>;
    case "epicgames":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M4 2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2l-3 2v-2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm3 4v12h8v-2h-6v-3h5v-2h-5V8h6V6H7z"/></svg>;
    case "windows":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3 5.5 11 4v7.5H3zM12 3.8 21 2.5V11h-9zM3 12.5h8V20L3 18.5zM12 12.5h9V21.5L12 20.2z"/></svg>;
    case "macos":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16.5 12.5c0-2.5 2-3.7 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4a10.5 10.5 0 0 0 1.4-2.9c-.1 0-2.8-1.1-2.8-3.9zm-2.4-7.1a4.4 4.4 0 0 0 1-3.2 4.5 4.5 0 0 0-3 1.5 4.2 4.2 0 0 0-1 3.1 3.8 3.8 0 0 0 3-1.4z"/></svg>;
    case "linux":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2c-2 0-3.5 1.5-3.5 4 0 1 .3 2 .3 3 0 1.5-2.5 3-2.5 6 0 3 2 7 5.7 7s5.7-4 5.7-7c0-3-2.5-4.5-2.5-6 0-1 .3-2 .3-3 0-2.5-1.5-4-3.5-4zm-1.5 3.5a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4zm3 0a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4zM12 8c1 0 2 .5 2 1s-1 1-2 1-2-.5-2-1 1-1 2-1z"/></svg>;
    case "huawei":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3 4c0 4 3 7 7 8-2 1-4 3-5 6h5V8m11-4c0 4-3 7-7 8 2 1 4 3 5 6h-5V8"/></svg>;
    case "threads":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16.5 11.2c-.1-.1-.2-.1-.3-.2-.2-3.4-2-5.3-5-5.3-1.8 0-3.4.8-4.3 2.2l1.7 1.2c.7-1 1.6-1.4 2.6-1.4 1.5 0 2.7.9 2.9 2.8-.9-.2-1.9-.2-3-.1-2.9.2-4.7 1.9-4.6 4.3.1 2.4 2.1 3.7 4.3 3.6 2.9-.2 4.6-2 5-4.8.7.4 1.2.9 1.5 1.5.5 1.1.5 3-1 4.5-1.3 1.3-2.9 1.9-5.3 1.9-2.6 0-4.6-.8-5.9-2.5C3.9 17.2 3.3 15.1 3.3 12s.6-5.2 1.8-6.9c1.3-1.7 3.3-2.5 5.9-2.5s4.6.8 5.9 2.6c.7.9 1.2 2 1.5 3.3l2-.5c-.3-1.5-.9-2.9-1.8-4C17 1.9 14.4 1 11 1c-3.3 0-6 1-7.8 3C1.5 5.9 1 8.6 1 12c0 3.5.5 6.2 2.2 8.1C5 22 7.6 23 11 23c3 0 5.2-.8 7-2.5 2.2-2.2 2.2-4.9 1.4-6.5-.5-1-1.4-1.9-2.9-2.8zm-4.8 4.7c-1.2.1-2.4-.5-2.5-1.5-.1-1 .9-1.7 2.2-1.8h.6c.7 0 1.4.1 2 .2-.2 2.4-1.4 3.1-2.3 3.1z"/></svg>;
    case "wechat":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8.5 4C4.9 4 2 6.4 2 9.4c0 1.6.9 3.1 2.4 4.1L4 15.2l2-1c.7.2 1.5.4 2.4.4l.6-.1c-.1-.4-.2-.9-.2-1.3 0-2.8 2.7-5 6.1-5H15c-.5-2.4-3.2-4.2-6.5-4.2zm-2 2.5a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm4 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm4.5 3.7c-3 0-5.5 2-5.5 4.4 0 2.5 2.5 4.5 5.5 4.5.6 0 1.2-.1 1.8-.3l1.7.9-.4-1.5c1.3-.8 2-2.2 2-3.6 0-2.4-2.5-4.4-5.1-4.4zm-1.5 2a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4zm3.5 0a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z"/></svg>;
    case "line":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C6.5 2 2 5.7 2 10.2c0 4 3.6 7.4 8.5 8 .3.1.8.2.9.5 0 .3 0 .8-.1 1.1l-.1.9c0 .3-.2 1 .9.6l6.4-3.8c1.4-.9 3.5-3.2 3.5-6.3C22 5.7 17.5 2 12 2zm-4 10.7H6.3c-.2 0-.4-.2-.4-.4V8.7c0-.2.2-.4.4-.4s.4.2.4.4v3.2H8c.2 0 .4.2.4.4s-.2.4-.4.4zm2 0c-.2 0-.4-.2-.4-.4V8.7c0-.2.2-.4.4-.4s.4.2.4.4v3.6c0 .2-.2.4-.4.4zm4.6 0c0 .2-.1.3-.3.4h-.1c-.1 0-.2 0-.3-.1L12.2 11v1.3c0 .2-.2.4-.4.4s-.4-.2-.4-.4V8.7c0-.2.1-.3.3-.4h.1c.1 0 .2 0 .3.1l1.7 2.3V8.7c0-.2.2-.4.4-.4s.4.2.4.4v3.6zm3 0c0 .2-.2.4-.4.4h-1.7c-.2 0-.4-.2-.4-.4V8.7c0-.2.2-.4.4-.4h1.7c.2 0 .4.2.4.4s-.2.4-.4.4h-1.3v.8h1.3c.2 0 .4.2.4.4s-.2.4-.4.4h-1.3v.8h1.3c.2 0 .4.2.4.4z"/></svg>;
    case "kakao":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.3 4.7 6.7-.2.7-.8 2.7-.9 3.2-.1.6.2.6.5.4.2-.1 3-2 4.2-2.9.5.1 1 .1 1.5.1 5.5 0 10-3.5 10-7.7C22 6.5 17.5 3 12 3z"/></svg>;
    case "viber":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C7 2 3 5.5 3 10c0 2.3 1.1 4.5 3 6v4l3.5-2c.8.2 1.7.3 2.5.3 5 0 9-3.5 9-8.3S17 2 12 2zm3.5 11c-.3.4-.9.7-1.4.6-1.5-.3-2.9-1-4-2.2-1.1-1.1-1.9-2.5-2.2-4 0-.5.2-1 .6-1.4l.4-.3c.2-.2.5-.2.7 0l.9 1.3c.2.2.1.5-.1.7l-.4.3c.2.7.6 1.4 1.2 2 .6.6 1.2 1 2 1.2l.3-.4c.2-.2.5-.2.7-.1l1.3.9c.2.2.2.5 0 .7l-.3.4z"/></svg>;
    case "signal":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l4.9-1.4A10 10 0 1 0 12 2z"/></svg>;
    case "skype":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.4 13.4a8.4 8.4 0 0 0-9.8-9.8 5 5 0 0 0-7 7 8.4 8.4 0 0 0 9.8 9.8 5 5 0 0 0 7-7zm-8.3 4.1c-2.7 0-4.9-1.3-4.9-2.9 0-.7.5-1.1 1.2-1.1 1.5 0 1.2 2.2 3.7 2.2 1.3 0 2.1-.7 2.1-1.4 0-.5-.3-1-1.3-1.2l-3.2-.8c-2.5-.6-3-2-3-3.3 0-2.6 2.5-3.6 4.9-3.6 2.1 0 4.6.8 4.6 2.4 0 .7-.6 1.1-1.3 1.1-1.3 0-1.1-1.8-3.6-1.8-1.2 0-1.9.5-1.9 1.3 0 .8.9 1.1 1.7 1.3l2.4.5c2.5.5 3.1 2 3.1 3.4 0 2.1-1.6 3.9-4.5 3.9z"/></svg>;
    case "zoom":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 2.5c.7.4 1.5-.1 1.5-.8V8.8c0-.7-.8-1.2-1.5-.8L16 10.5V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z"/></svg>;
    case "teams":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3 7h9v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7zm3-4h3v3H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm7 0h4a1 1 0 0 1 1 1v3h-5V3zm5 4h3v7a2 2 0 0 1-2 2h-1V7zM7 9v2h1.5v5h1V11H11V9H7z"/></svg>;
    case "slack":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5zm2-9a2 2 0 1 1 2-2v2H9zm0 1a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4h5zm9 2a2 2 0 1 1 2 2h-2V9zm-1 0a2 2 0 1 1-4 0V4a2 2 0 1 1 4 0v5zm-2 9a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z"/></svg>;
    case "gmail":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 6a2 2 0 0 1 2-2h1v13H4a2 2 0 0 1-2-2V6zm18 0v11h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1v2zM5 4l7 5 7-5v13h-3V9.8L12 13 8 9.8V17H5V4z"/></svg>;
    case "outlook":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 6a2 2 0 0 1 2-2h9v16H4a2 2 0 0 1-2-2V6zm5.5 3.5A2.5 2.5 0 1 0 7.5 14.5a2.5 2.5 0 0 0 0-5zM14 5h7a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-7V5z"/></svg>;
    case "drive":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9 3h6l6 10.5-3 5.5H6L3 13.5 9 3zm0 2L4.5 13h6L15 5H9zm2 9-3 5h12l-3-5H11z"/></svg>;
    case "dropbox":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M7 2 2 5.5 7 9l5-3.5L7 2zm10 0-5 3.5L17 9l5-3.5L17 2zM2 12.5 7 16l5-3.5L7 9l-5 3.5zm15-3.5-5 3.5 5 3.5 5-3.5-5-3.5zM7 17l5 3.5L17 17l-5-3.5L7 17z"/></svg>;
    case "onedrive":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M10.5 7a5.5 5.5 0 0 1 5.4 4.4l.6-.1a4 4 0 0 1 3.5 6h-14A4.5 4.5 0 0 1 5 8.5c.4 0 .8 0 1.2.2A5.5 5.5 0 0 1 10.5 7z"/></svg>;
    case "icloud":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.8 1A4 4 0 0 0 6 19h11.5z"/></svg>;
    case "notion":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8v8M8 8l8 8M16 8v8" strokeLinecap="round"/></svg>;
    case "figma":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8.5 2h3.5v7H8.5a3.5 3.5 0 1 1 0-7zm7 0a3.5 3.5 0 1 1 0 7H12V2h3.5zM12 9.5a3.5 3.5 0 1 1 3.5 3.5H12V9.5zm-3.5 0H12V16H8.5a3.5 3.5 0 1 1 0-6.5zM12 16h-.5V22h-.5a3.5 3.5 0 1 1 .5-7 3.5 3.5 0 0 1 .5.5V16z"/></svg>;
    case "behance":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 6h6c2 0 3.5 1 3.5 3s-1 2.5-2 2.8c1.5.2 2.5 1.5 2.5 3.2 0 2.5-2 3.5-4 3.5H2V6zm2.5 2.5v2.5h3c.8 0 1.5-.4 1.5-1.3s-.7-1.2-1.5-1.2h-3zm0 4.5v3h3c1 0 1.7-.5 1.7-1.5 0-1.1-.7-1.5-1.7-1.5h-3zM14 7h6v1.5h-6V7zm7.5 6c0 2.5-1.5 4.5-4.2 4.5S13 15.7 13 13s1.5-4.5 4.2-4.5c2.6 0 4.3 2 4.3 4.5zm-6.3-.7h4c-.1-1.1-.8-1.9-2-1.9s-1.9.8-2 1.9zm4 1.5h-4c.1 1.2.9 2 2 2 .8 0 1.5-.4 1.8-1.2l1.7.6c-.5 1.4-1.8 2.3-3.5 2.3-2.4 0-4-1.7-4-4 0-.3 0-.6.1-.9l5.9 1.2z"/></svg>;
    case "dribbble":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><path d="M8 3.2A20 20 0 0 1 18 20M2.5 10a20 20 0 0 0 19-2M4 17c4-4 10-5 17-3" strokeLinecap="round"/></svg>;
    case "netflix":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 2v20l3.5-.5V13l4.5 9.3L18 22V2l-3.5.5V11L10 2H6z"/></svg>;
    case "shahid":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 12 8 4l3 4-6 8h6l3 4H2v-8zm10 0 6-8h6v8l-6 8-3-4 6-8h-6l-3 4z"/></svg>;
    case "anghami":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM9 7c.6 0 1 .4 1 1v9c0 .6-.4 1-1 1s-1-.4-1-1V8c0-.6.4-1 1-1zm6 0c.6 0 1 .4 1 1v9c0 .6-.4 1-1 1s-1-.4-1-1V8c0-.6.4-1 1-1zM6 10c.6 0 1 .4 1 1v3c0 .6-.4 1-1 1s-1-.4-1-1v-3c0-.6.4-1 1-1zm12 0c.6 0 1 .4 1 1v3c0 .6-.4 1-1 1s-1-.4-1-1v-3c0-.6.4-1 1-1zm-6-2c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1s-1-.4-1-1V9c0-.6.4-1 1-1z"/></svg>;
    case "applemusic":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20 3 8 5.5v10.1A3.5 3.5 0 1 0 10 19V9l10-2v6.6A3.5 3.5 0 1 0 22 17V3z"/></svg>;
    case "spotifyBrand":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.6.6 0 0 1-.8.2c-2.3-1.4-5.2-1.7-8.6-.9a.6.6 0 1 1-.3-1.2c3.8-.9 7-.5 9.5 1 .3.2.4.6.2.9zm1.2-2.7a.8.8 0 0 1-1 .3c-2.7-1.6-6.7-2.1-9.9-1.1a.8.8 0 1 1-.5-1.5c3.6-1.1 8-.6 11.1 1.3.4.2.5.7.3 1zm.1-2.8c-3.2-1.9-8.4-2-11.4-1.1a.9.9 0 1 1-.5-1.7c3.4-1 9.2-.8 12.8 1.3.5.3.7.9.4 1.4-.3.4-.9.5-1.3.2z"/></svg>;
    case "primevideo":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 8h4l2 6 2-6h4l-4 10h-4L2 8zm12 0h3.5c2 0 3 1 3 2.5s-1 2.5-3 2.5H16v5h-2V8zm2 1.5v2H17c.7 0 1-.4 1-1s-.3-1-1-1h-1z"/></svg>;
    case "disneyplus":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 8h2v8H2V8zm3 0h3c2 0 3.5 1.5 3.5 4S10 16 8 16H5V8zm2 2v4h.8c1 0 1.7-.7 1.7-2s-.7-2-1.7-2H7zm5-2h2v8h-2V8zm3 0h4v2h-2v6h-2V8zm5 4h3v1.5h-3V16h-1.5v-2.5H16V12h1.5V9h1.5v3z"/></svg>;
    case "quora":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a9 9 0 1 0 4 17l1 2h3l-2-3.3A9 9 0 0 0 12 2zm0 3c3 0 5 2.4 5 6s-2 6-5 6c-.7 0-1.3-.1-1.9-.4l-.9-2 3 .8c-.2-1.2-1.1-2-2.4-2-1.5 0-2.5 1-2.5 1S6.5 12.7 7 10c.5-3 2.5-5 5-5z"/></svg>;
    case "mastodon":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20 10c0-4-2.5-5-2.5-5A16 16 0 0 0 12 4a16 16 0 0 0-5.5 1S4 6 4 10v4c0 3 2 5 5 5 3 0 4-1 4-1v-2s-1.5.7-3.5.7c-2 0-2.5-1-2.5-1s3 1 6 0v-2c-3 1-6 0-6 0v-1s3 1 6 0V10c0-2-1.5-2.5-2.5-2.5S9 8.5 9 9.5v3H7v-3C7 8 8 6 10.5 6S13 8 13 9.5V13c0 .5.5 1 1.5 1s1.5-.5 1.5-1v-3c0-1.5 1-3.5 2.5-3.5S21 8 21 9.5V13h-1z"/></svg>;
    case "bluesky":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 3c2 1 4 3 6 6 2-3 4-5 6-6 2 0 3 1.5 3 4 0 2-.5 3-1 4-.5.5-2 1-4 1 3 0 4 1 4 3s-2 5-5 5c-2 0-3-2-3-4 0 2-1 4-3 4-3 0-5-3-5-5s1-3 4-3c-2 0-3.5-.5-4-1-.5-1-1-2-1-4 0-2.5 1-4 3-4z"/></svg>;
    case "threema":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 0 0-9 14.5L2 22l5.5-1.4A10 10 0 1 0 12 2zM8 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>;
    case "xbox":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2a10 10 0 0 0-6.6 2.5c2.5-.3 5.5 1.8 6.6 3 1.1-1.2 4.1-3.3 6.6-3A10 10 0 0 0 12 2zM4 6.3A10 10 0 0 0 6.6 20c-.4-2.7 1.4-7.7 4.3-11-1.5-1.7-4.4-3.7-6.9-2.7zm16 0c-2.5-1-5.4 1-6.9 2.7 2.9 3.3 4.7 8.3 4.3 11A10 10 0 0 0 20 6.3zM12 10.5c-2 2.2-4 6.3-4 8.7 0 1 1.5 1.7 4 1.7s4-.7 4-1.7c0-2.4-2-6.5-4-8.7z"/></svg>;
    case "playstation":
      return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9 2v18l4-1V6.5c0-1 .3-1.5 1-1.5s1 .7 1 2.3v4.4c2 .9 3.5 1.5 5 1.5.5 0 1-.1 1-.8 0-1.7-1.4-3-4.5-4.3C13 6.5 9.7 5.4 9 2zM3 15.8c0 1.4 1.2 2 3 1.4l3-1v-2l-3 1c-.5.2-.7 0-.7-.2 0-.4.5-.8 1.3-1.1L9 13V11l-4 1.4c-1.4.5-2 1.7-2 3.4zm18 .2c0-1-.5-1.6-1.8-2.2L15 12v2l4.5 1.6c.5.2.7.3.7.5s-.2.3-.7.3l-4.5-1.5v2l4 1.4c1.5.6 2.5.3 2.5-.7"/></svg>;
    // ===== monochrome / line versions =====
    case "threadsAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 11c-.5-2.5-2.5-4-5-4-2 0-3.5 1-4.5 2.5"/><path d="M8 15c1 1 2.5 1.5 4 1.5 3 0 5-1.7 5-4 0-2-1.5-3.5-4-3.5-3 0-5 1.5-5 3.5"/><path d="M20 12a8 8 0 1 1-8-8 8 8 0 0 1 8 8z"/></svg>;
    case "wechatAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8.5 4C4.9 4 2 6.4 2 9.4c0 1.6.9 3.1 2.4 4.1L4 15.2l2-1c.7.2 1.5.4 2.4.4"/><path d="M15 10.2c-3 0-5.5 2-5.5 4.4 0 2.5 2.5 4.5 5.5 4.5.6 0 1.2-.1 1.8-.3l1.7.9-.4-1.5c1.3-.8 2-2.2 2-3.6 0-2.4-2.5-4.4-5.1-4.4z"/><circle cx="6.5" cy="7.5" r=".6"/><circle cx="10.5" cy="7.5" r=".6"/><circle cx="13.5" cy="13.5" r=".5"/><circle cx="17" cy="13.5" r=".5"/></svg>;
    case "lineAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 10.5c0-4.7-4.5-8.5-10-8.5S2 5.8 2 10.5c0 4.2 3.6 7.8 8.5 8.4.4.1.7.3.7.6l-.2 1.5c0 .3.3.8.9.5l5.5-3.3c2.2-1.4 4.6-3.6 4.6-7.7z"/><path d="M7 9v3.5h1.5M11 9v3.5M14 9v3.5l2 0M18 9v3.5l-1.7-3.5v3.5"/></svg>;
    case "kakaoAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.3 4.7 6.7-.2.7-.8 2.7-.9 3.2-.1.6.2.6.5.4.2-.1 3-2 4.2-2.9.5.1 1 .1 1.5.1 5.5 0 10-3.5 10-7.7C22 6.5 17.5 3 12 3z"/></svg>;
    case "viberAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2C7 2 3 5.5 3 10c0 2.3 1.1 4.5 3 6v4l3.5-2c.8.2 1.7.3 2.5.3 5 0 9-3.5 9-8.3S17 2 12 2z"/><path d="M8 8c0 3 2 6 5 7"/><path d="M14 8c1 0 2 1 2 2"/></svg>;
    case "signalAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l4.9-1.4A10 10 0 1 0 12 2z"/></svg>;
    case "skypeAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="9"/><path d="M8 14c.5 1.5 2 2.5 4 2.5s3.5-.8 3.5-2.3-1.5-1.8-3.5-2.2-3.5-.7-3.5-2.2S9.5 7.5 11.5 7.5s3.5 1 4 2.5"/></svg>;
    case "zoomAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="14" height="10" rx="2"/><path d="m16 11 5-3v8l-5-3z"/></svg>;
    case "teamsAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="7" width="10" height="10" rx="1"/><path d="M6 10h4M8 10v4"/><circle cx="17" cy="7" r="2"/><path d="M14 12h5a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/></svg>;
    case "slackAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="10" y="2" width="4" height="12" rx="2"/><rect x="10" y="15" width="4" height="7" rx="2"/><rect x="2" y="10" width="12" height="4" rx="2"/><rect x="15" y="10" width="7" height="4" rx="2"/></svg>;
    case "gmailAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/></svg>;
    case "outlookAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="4" width="12" height="16" rx="1"/><ellipse cx="8" cy="12" rx="3" ry="3.5"/><path d="M14 8h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-7"/></svg>;
    case "quoraAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="11" r="9"/><path d="m16 18 3 4"/></svg>;
    case "mastodonAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 14c0 3-2 5-5 5-3 0-4-1-4-1M4 14c0-6 0-9 3-10 2-.8 8-.8 10 0 3 1 3 4 3 10"/><path d="M8 10v4M16 10v4M8 10c0-1.5 1-2.5 2-2.5s2 1 2 2.5M16 10c0-1.5-1-2.5-2-2.5s-2 1-2 2.5"/></svg>;
    case "blueskyAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 3c2 1 4 3 6 6 2-3 4-5 6-6 2 0 3 1.5 3 4 0 2-.5 3-1 4-.5.5-2 1-4 1 3 0 4 1 4 3s-2 5-5 5c-2 0-3-2-3-4 0 2-1 4-3 4-3 0-5-3-5-5s1-3 4-3c-2 0-3.5-.5-4-1-.5-1-1-2-1-4 0-2.5 1-4 3-4z"/></svg>;
    case "threemaAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a10 10 0 0 0-9 14.5L2 22l5.5-1.4A10 10 0 1 0 12 2z"/><circle cx="8" cy="12" r=".8"/><circle cx="12" cy="12" r=".8"/><circle cx="16" cy="12" r=".8"/><path d="M8 10V8a4 4 0 0 1 8 0v2"/></svg>;
    case "playstoreAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 3v18l14-9z"/><path d="m4 3 10 9-10 9"/></svg>;
    case "appstoreAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m7 16 5-8 5 8M9 14h6"/></svg>;
    case "appgalleryAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 8v4a3 3 0 0 0 6 0V8"/></svg>;
    case "galaxystoreAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M15 10c0-1.5-1.5-2-3-2s-3 .5-3 2c0 3 6 1.5 6 4 0 1.5-1.5 2-3 2s-3-.5-3-2"/></svg>;
    case "amazonAppstoreAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 17c5 3 11 3 16 0"/><path d="M6 19c4 2 8 2 12 1"/><path d="M9 12v-2a3 3 0 0 1 6 0v3c0 1.5-1 3-3 3s-3-1-3-2.5S10.5 11 15 11"/></svg>;
    case "microsoftStoreAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>;
    case "macAppstoreAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m7 16 5-8 5 8M9 14h6"/></svg>;
    case "huaweiAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 5c0 4 3 7 7 8-2 1-4 3-5 6h5V6"/><path d="M21 5c0 4-3 7-7 8 2 1 4 3 5 6h-5V6"/></svg>;
    case "steamAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="16" cy="9" r="2.5"/><circle cx="9" cy="15" r="2"/><path d="m11 14 4-3"/></svg>;
    case "epicgamesAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M8 7v10M8 7h6M8 12h5M8 17h6"/><path d="m14 19-2 3"/></svg>;
    case "xboxAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M6 5c2.5-.3 5 1.8 6 3 1-1.2 3.5-3.3 6-3M4 7c-.5 3 3 8 6 12M20 7c.5 3-3 8-6 12"/></svg>;
    case "playstationAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 3v17l4-1V6c0-.8.5-1.3 1-1.3s1 .5 1 1.8v4.5c2 .9 4 1.5 5 1.3"/><path d="M3 16c0 1.4 1.2 2 3 1.4l3-1M15 14l6 2c.5.2.7.3.7.5s-.2.3-.7.3l-6.5-2"/></svg>;
    case "androidAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 11a8 8 0 0 1 16 0v5H4z"/><path d="M6 4.5 7.5 7M18 4.5 16.5 7"/><circle cx="9" cy="11" r=".6"/><circle cx="15" cy="11" r=".6"/><path d="M6 16v3M18 16v3"/></svg>;
    case "appleAlt":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16.5 12.5c0-2.5 2-3.7 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4a10.5 10.5 0 0 0 1.4-2.9"/><path d="M14.1 5.4a4.4 4.4 0 0 0 1-3.2 4.5 4.5 0 0 0-3 1.5 4.2 4.2 0 0 0-1 3.1 3.8 3.8 0 0 0 3-1.4z"/></svg>;

  }
}
