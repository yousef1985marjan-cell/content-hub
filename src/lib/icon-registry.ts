/* Curated icon registry — every icon used across the site & admin.
 * Grouped into collapsible categories in the admin panel. */

export type IconCategoryKey =
  | "navigation"
  | "header"
  | "dashboard"
  | "pages"
  | "search"
  | "location"
  | "time"
  | "pharmacy"
  | "forms"
  | "actions"
  | "crud"
  | "share"
  | "users"
  | "settings"
  | "alerts"
  | "theme"
  | "social"
  | "appstore"
  | "media"
  | "info";

export const ICON_CATEGORIES: { key: IconCategoryKey; label: string }[] = [
  { key: "navigation", label: "القائمة والتنقل" },
  { key: "header", label: "الهيدر والفوتر" },
  { key: "dashboard", label: "لوحة التحكم" },
  { key: "pages", label: "الصفحات والأقسام" },
  { key: "search", label: "البحث والفلاتر" },
  { key: "location", label: "الموقع والخرائط" },
  { key: "time", label: "الوقت والتقويم" },
  { key: "pharmacy", label: "الصيدليات والدواء" },
  { key: "forms", label: "الحقول والنماذج" },
  { key: "actions", label: "الأزرار والإجراءات" },
  { key: "crud", label: "الإضافة والحفظ والتعديل والحذف" },
  { key: "share", label: "النسخ والمشاركة والنشر" },
  { key: "users", label: "المستخدمون والصلاحيات" },
  { key: "settings", label: "الإعدادات" },
  { key: "alerts", label: "التنبيهات والحالات" },
  { key: "theme", label: "المظهر النهاري والليلي" },
  { key: "social", label: "منصات التواصل" },
  { key: "appstore", label: "متاجر التطبيقات" },
  { key: "media", label: "الفيديوهات والصور" },
  { key: "info", label: "المعلومات والمساعدة" },
];

export type IconRegistryEntry = {
  id: string;
  arName: string;
  lucideName: string;
  category: IconCategoryKey;
  usedIn: string[];
};

export const ICON_REGISTRY: IconRegistryEntry[] = [
  // navigation
  { id: "menu", arName: "قائمة", lucideName: "Menu", category: "navigation", usedIn: ["الهيدر"] },
  { id: "close", arName: "إغلاق", lucideName: "X", category: "navigation", usedIn: ["القائمة الجانبية", "النوافذ المنبثقة"] },
  { id: "chevron-down", arName: "سهم للأسفل", lucideName: "ChevronDown", category: "navigation", usedIn: ["الأقسام القابلة للطي"] },
  { id: "chevron-up", arName: "سهم للأعلى", lucideName: "ChevronUp", category: "navigation", usedIn: ["الأقسام"] },
  { id: "chevron-right", arName: "سهم لليمين", lucideName: "ChevronRight", category: "navigation", usedIn: ["روابط"] },
  { id: "chevron-left", arName: "سهم لليسار", lucideName: "ChevronLeft", category: "navigation", usedIn: ["روابط"] },
  { id: "arrow-right", arName: "سهم يمين", lucideName: "ArrowRight", category: "navigation", usedIn: ["الأزرار"] },
  { id: "arrow-left", arName: "سهم يسار", lucideName: "ArrowLeft", category: "navigation", usedIn: ["الأزرار"] },
  { id: "home", arName: "الرئيسية", lucideName: "Home", category: "navigation", usedIn: ["القائمة"] },
  { id: "external-link", arName: "رابط خارجي", lucideName: "ExternalLink", category: "navigation", usedIn: ["الروابط الخارجية"] },

  // header
  { id: "heart", arName: "شعار القلب", lucideName: "Heart", category: "header", usedIn: ["اللوكو الاحتياطي"] },
  { id: "logo-image", arName: "اللوكو", lucideName: "Image", category: "header", usedIn: ["الهيدر"] },

  // dashboard
  { id: "layout-dashboard", arName: "لوحة التحكم", lucideName: "LayoutDashboard", category: "dashboard", usedIn: ["لوحة التحكم"] },
  { id: "sparkles", arName: "البصمة البصرية", lucideName: "Sparkles", category: "dashboard", usedIn: ["قسم البصمة"] },
  { id: "palette", arName: "الأيقونات", lucideName: "Palette", category: "dashboard", usedIn: ["إدارة الأيقونات"] },
  { id: "type", arName: "الخطوط", lucideName: "Type", category: "dashboard", usedIn: ["إدارة الخطوط"] },

  // pages
  { id: "file-text", arName: "صفحة", lucideName: "FileText", category: "pages", usedIn: ["الصفحات"] },
  { id: "book-open", arName: "من نحن", lucideName: "BookOpen", category: "pages", usedIn: ["صفحة من نحن"] },
  { id: "shield", arName: "الخصوصية", lucideName: "Shield", category: "pages", usedIn: ["سياسة الخصوصية"] },
  { id: "scale", arName: "الشروط", lucideName: "Scale", category: "pages", usedIn: ["الشروط"] },
  { id: "alert-triangle", arName: "إخلاء المسؤولية", lucideName: "AlertTriangle", category: "pages", usedIn: ["إخلاء المسؤولية"] },

  // search
  { id: "search", arName: "بحث", lucideName: "Search", category: "search", usedIn: ["الهيدر", "الفلاتر"] },
  { id: "filter", arName: "فلتر", lucideName: "Filter", category: "search", usedIn: ["فلاتر الأزرار"] },
  { id: "sliders", arName: "خيارات", lucideName: "SlidersHorizontal", category: "search", usedIn: ["الإعدادات المتقدمة"] },

  // location
  { id: "map-pin", arName: "موقع", lucideName: "MapPin", category: "location", usedIn: ["الصيدليات"] },
  { id: "map", arName: "خريطة", lucideName: "Map", category: "location", usedIn: ["الخريطة"] },
  { id: "navigation", arName: "الاتجاه", lucideName: "Navigation", category: "location", usedIn: ["الإرشاد"] },

  // time
  { id: "clock", arName: "الوقت", lucideName: "Clock", category: "time", usedIn: ["أوقات العمل"] },
  { id: "calendar", arName: "التقويم", lucideName: "Calendar", category: "time", usedIn: ["التواريخ"] },

  // pharmacy
  { id: "pill", arName: "دواء", lucideName: "Pill", category: "pharmacy", usedIn: ["الصيدليات"] },
  { id: "cross", arName: "صيدلية", lucideName: "Cross", category: "pharmacy", usedIn: ["الصيدليات"] },
  { id: "stethoscope", arName: "طبي", lucideName: "Stethoscope", category: "pharmacy", usedIn: ["الرعاية"] },

  // forms
  { id: "input-cursor", arName: "حقل نص", lucideName: "TextCursorInput", category: "forms", usedIn: ["النماذج"] },
  { id: "check-square", arName: "خانة اختيار", lucideName: "CheckSquare", category: "forms", usedIn: ["النماذج"] },
  { id: "list", arName: "قائمة", lucideName: "List", category: "forms", usedIn: ["القوائم"] },

  // actions
  { id: "check", arName: "تأكيد", lucideName: "Check", category: "actions", usedIn: ["أزرار الحفظ"] },
  { id: "send", arName: "إرسال / نشر", lucideName: "Send", category: "actions", usedIn: ["حفظ ونشر"] },
  { id: "download", arName: "تنزيل", lucideName: "Download", category: "actions", usedIn: ["تنزيل التطبيق"] },
  { id: "upload", arName: "رفع", lucideName: "Upload", category: "actions", usedIn: ["رفع اللوكو"] },
  { id: "rotate", arName: "استعادة / إعادة", lucideName: "RotateCcw", category: "actions", usedIn: ["استعادة الافتراضي"] },

  // crud
  { id: "plus", arName: "إضافة", lucideName: "Plus", category: "crud", usedIn: ["إضافة عناصر"] },
  { id: "save", arName: "حفظ", lucideName: "Save", category: "crud", usedIn: ["الحفظ"] },
  { id: "pencil", arName: "تعديل", lucideName: "Pencil", category: "crud", usedIn: ["التعديل"] },
  { id: "trash", arName: "حذف", lucideName: "Trash2", category: "crud", usedIn: ["الحذف"] },
  { id: "eye", arName: "عرض / معاينة", lucideName: "Eye", category: "crud", usedIn: ["المعاينة"] },
  { id: "eye-off", arName: "إخفاء", lucideName: "EyeOff", category: "crud", usedIn: ["الإخفاء"] },

  // share
  { id: "copy", arName: "نسخ", lucideName: "Copy", category: "share", usedIn: ["نسخ الرابط"] },
  { id: "share", arName: "مشاركة", lucideName: "Share2", category: "share", usedIn: ["المشاركة"] },
  { id: "link", arName: "رابط", lucideName: "Link", category: "share", usedIn: ["الروابط"] },

  // users
  { id: "user", arName: "مستخدم", lucideName: "User", category: "users", usedIn: ["الحساب"] },
  { id: "users", arName: "مستخدمون", lucideName: "Users", category: "users", usedIn: ["إدارة المستخدمين"] },
  { id: "user-cog", arName: "صلاحيات", lucideName: "UserCog", category: "users", usedIn: ["الصلاحيات"] },
  { id: "log-in", arName: "تسجيل الدخول", lucideName: "LogIn", category: "users", usedIn: ["الدخول"] },
  { id: "log-out", arName: "تسجيل الخروج", lucideName: "LogOut", category: "users", usedIn: ["الخروج"] },
  { id: "lock", arName: "قفل", lucideName: "Lock", category: "users", usedIn: ["الأمان"] },

  // settings
  { id: "settings", arName: "الإعدادات", lucideName: "Settings", category: "settings", usedIn: ["الإعدادات"] },
  { id: "wrench", arName: "أدوات", lucideName: "Wrench", category: "settings", usedIn: ["الصيانة"] },
  { id: "database", arName: "قاعدة البيانات", lucideName: "Database", category: "settings", usedIn: ["البيانات"] },

  // alerts
  { id: "info", arName: "معلومة", lucideName: "Info", category: "alerts", usedIn: ["التنبيهات"] },
  { id: "alert-circle", arName: "تحذير", lucideName: "AlertCircle", category: "alerts", usedIn: ["الأخطاء"] },
  { id: "check-circle", arName: "نجاح", lucideName: "CheckCircle2", category: "alerts", usedIn: ["النجاح"] },
  { id: "x-circle", arName: "فشل", lucideName: "XCircle", category: "alerts", usedIn: ["الفشل"] },
  { id: "bell", arName: "جرس", lucideName: "Bell", category: "alerts", usedIn: ["الإشعارات"] },

  // theme
  { id: "sun", arName: "المظهر النهاري", lucideName: "Sun", category: "theme", usedIn: ["زر التبديل"] },
  { id: "moon", arName: "المظهر الليلي", lucideName: "Moon", category: "theme", usedIn: ["زر التبديل"] },
  { id: "monitor", arName: "تلقائي", lucideName: "Monitor", category: "theme", usedIn: ["زر التبديل"] },

  // social
  { id: "social-facebook", arName: "فيسبوك", lucideName: "Facebook", category: "social", usedIn: ["منصات شفاء"] },
  { id: "social-instagram", arName: "إنستجرام", lucideName: "Instagram", category: "social", usedIn: ["منصات شفاء"] },
  { id: "social-youtube", arName: "يوتيوب", lucideName: "Youtube", category: "social", usedIn: ["منصات شفاء"] },
  { id: "social-twitter", arName: "تويتر", lucideName: "Twitter", category: "social", usedIn: ["منصات شفاء"] },
  { id: "social-linkedin", arName: "لينكدإن", lucideName: "Linkedin", category: "social", usedIn: ["منصات شفاء"] },
  { id: "social-mail", arName: "البريد", lucideName: "Mail", category: "social", usedIn: ["التواصل"] },
  { id: "social-phone", arName: "الهاتف", lucideName: "Phone", category: "social", usedIn: ["التواصل"] },
  { id: "social-message", arName: "رسالة", lucideName: "MessageCircle", category: "social", usedIn: ["المراسلة"] },
  { id: "social-globe", arName: "الويب", lucideName: "Globe", category: "social", usedIn: ["الموقع"] },

  // appstore
  { id: "store-apple", arName: "آب ستور", lucideName: "Apple", category: "appstore", usedIn: ["تحميل التطبيق"] },
  { id: "store-android", arName: "أندرويد", lucideName: "Smartphone", category: "appstore", usedIn: ["تحميل التطبيق"] },

  // media
  { id: "video", arName: "فيديو", lucideName: "Video", category: "media", usedIn: ["الفيديوهات"] },
  { id: "play", arName: "تشغيل", lucideName: "Play", category: "media", usedIn: ["الفيديوهات"] },
  { id: "image", arName: "صورة", lucideName: "Image", category: "media", usedIn: ["الصور"] },
  { id: "camera", arName: "كاميرا", lucideName: "Camera", category: "media", usedIn: ["الصور"] },

  // info
  { id: "help", arName: "مساعدة", lucideName: "HelpCircle", category: "info", usedIn: ["المساعدة"] },
  { id: "question", arName: "سؤال", lucideName: "CircleHelp", category: "info", usedIn: ["الأسئلة"] },
  { id: "book", arName: "دليل", lucideName: "Book", category: "info", usedIn: ["الدليل"] },
];

export function iconsByCategory(cat: IconCategoryKey) {
  return ICON_REGISTRY.filter((i) => i.category === cat);
}
