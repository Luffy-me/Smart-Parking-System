import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Languages, Sun, Moon, Menu, MapPin, GraduationCap, Mail, Phone, Send, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

function MarketingHeader() {
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: t("marketing.navHome") },
    { href: "/about", label: t("marketing.navAbout") },
    { href: "/pricing", label: t("marketing.navPricing") },
    { href: "/contact", label: t("marketing.navContact") },
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border/60">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-xl tracking-tight">{t("appName")}</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
              {t("marketing.susuShort")} · {t("marketing.cityName")}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => {
            const active = location === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={toggleLang} className="h-9 px-2 gap-1.5" aria-label={t("common.language")}>
            <Languages className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">{lang === "en" ? "EN" : "RU"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden md:flex items-center gap-1.5 ml-1">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">{t("hero.ctaSecondary")}</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gap-1.5">
                {t("hero.ctaPrimary")} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                  <Logo className="h-9 w-9" />
                  <span className="font-bold text-xl">{t("appName")}</span>
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium"
                    >
                      {n.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t mt-6 pt-6 flex flex-col gap-2">
                  <Link href="/sign-in">
                    <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>{t("hero.ctaSecondary")}</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="w-full gap-1.5" onClick={() => setOpen(false)}>
                      {t("hero.ctaPrimary")} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function MarketingFooter() {
  const { t } = useI18n();

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
    if (!email || !email.includes("@")) return;
    toast.success(t("footer.newsletterToast"));
    form.reset();
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="relative bg-slate-950 text-slate-200 border-t border-slate-900"
    >
      <div className="absolute inset-0 grid-bg opacity-[0.07] pointer-events-none" />
      <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Logo className="h-10 w-10" />
            <div>
              <div className="font-bold text-xl text-white">{t("appName")}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mt-0.5">{t("marketing.susuShort")}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-sm">{t("footer.blurb")}</p>
          <div className="mt-5 flex flex-col gap-2 text-sm">
            <span className="inline-flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-primary soft-pulse" />
              {t("marketing.cityAvailable")}
            </span>
            <span className="inline-flex items-center gap-2 text-slate-300">
              <GraduationCap className="h-4 w-4 text-primary" />
              {t("marketing.susuBadge")}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">{t("footer.product")}</div>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/" className="text-slate-300 hover:text-white transition-colors">{t("marketing.navHome")}</Link></li>
            <li><Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">{t("marketing.navPricing")}</Link></li>
            <li><Link href="/sign-up" className="text-slate-300 hover:text-white transition-colors">{t("hero.ctaPrimary")}</Link></li>
            <li><Link href="/sign-in" className="text-slate-300 hover:text-white transition-colors">{t("hero.ctaSecondary")}</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">{t("footer.company")}</div>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">{t("marketing.navAbout")}</Link></li>
            <li><Link href="/contact" className="text-slate-300 hover:text-white transition-colors">{t("marketing.navContact")}</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">{t("footer.newsletterTitle")}</div>
          <p className="text-sm text-slate-400 mb-3">{t("footer.newsletterHint")}</p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <Input
              type="email"
              name="email"
              required
              placeholder={t("footer.newsletterPlaceholder")}
              className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 h-10"
            />
            <Button type="submit" size="sm" className="h-10 px-3 gap-1.5">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">{t("footer.newsletterCta")}</span>
            </Button>
          </form>
          <ul className="mt-5 space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" /> {t("footer.addressLine")}</li>
            <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-500" /> {t("footer.emailValue")}</li>
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-500" /> {t("footer.phoneValue")}</li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} {t("appName")}. {t("footer.legal")} {t("footer.builtBy")}</div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub" className="hover:text-slate-200 transition-colors"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-slate-200 transition-colors"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="X / Twitter" className="hover:text-slate-200 transition-colors"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
