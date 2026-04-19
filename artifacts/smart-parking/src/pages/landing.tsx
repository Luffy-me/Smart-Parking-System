import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Map,
  CalendarRange,
  Zap,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  MapPin,
  GraduationCap,
  Quote,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";


const HERO_IMG = "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80";

export default function Landing() {
  const { t } = useI18n();

  const testimonials = [
    {
      quote: t("landing.t1Quote"),
      name: t("landing.t1Name"),
      role: t("landing.t1Role"),
      avatar: "MA",
    },
    {
      quote: t("landing.t2Quote"),
      name: t("landing.t2Name"),
      role: t("landing.t2Role"),
      avatar: "EP",
    },
    {
      quote: t("landing.t3Quote"),
      name: t("landing.t3Name"),
      role: t("landing.t3Role"),
      avatar: "IK",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-primary soft-pulse" /> {t("hero.eyebrow")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-card text-xs font-medium">
                <MapPin className="h-3 w-3 text-primary" /> {t("marketing.cityAvailable")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-card text-xs font-medium">
                <GraduationCap className="h-3 w-3 text-primary" /> {t("marketing.susuShort")}
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]"
            >
              {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-gradient-teal">
                {t("hero.title").split(" ").slice(-2).join(" ")}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 h-12 px-6 text-base">
                  {t("hero.ctaPrimary")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                  {t("marketing.navAbout")}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl"
            >
              {[
                { v: "1", l: t("hero.stat1") },
                { v: "1,240", l: t("hero.stat2") },
                { v: "8.9k", l: t("hero.stat3") },
                { v: "99.98%", l: t("hero.stat4") },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight">{s.v}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Layered hero composition: Chelyabinsk imagery + route overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-square rounded-3xl border border-border/70 bg-card/60 backdrop-blur overflow-hidden shadow-xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${HERO_IMG})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-950/40 to-primary/30 mix-blend-multiply" />
              <div className="absolute inset-0 grid-bg opacity-25" />
              <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                    <stop offset="1" stopColor="hsl(var(--chart-2))" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <path
                  d="M30,300 Q120,260 180,200 T370,80"
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  className="dash-flow"
                />
                <path
                  d="M50,80 Q140,160 220,180 T380,320"
                  fill="none"
                  stroke="hsl(var(--chart-2))"
                  strokeOpacity="0.7"
                  strokeWidth="2.5"
                  strokeDasharray="6 8"
                  className="dash-flow"
                  style={{ animationDuration: "8s" }}
                />
                {[
                  [60, 290, "primary"],
                  [180, 200, "chart-2"],
                  [310, 120, "primary"],
                  [80, 100, "chart-2"],
                  [340, 300, "primary"],
                ].map(([x, y, c], i) => (
                  <g key={i}>
                    <circle cx={x as number} cy={y as number} r="6" fill={`hsl(var(--${c}))`} />
                    <circle
                      cx={x as number}
                      cy={y as number}
                      r="14"
                      fill={`hsl(var(--${c}))`}
                      fillOpacity="0.25"
                      className="soft-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  </g>
                ))}
              </svg>
              <div className="absolute top-4 left-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur border text-[11px] font-semibold uppercase tracking-wider">
                  <MapPin className="h-3 w-3 text-primary" /> {t("marketing.cityLive")}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                {[
                  { i: Map, l: t("marketing.featureLive") },
                  { i: Zap, l: t("marketing.featureEv") },
                  { i: BarChart3, l: t("marketing.featureInsights") },
                ].map(({ i: Icon, l }) => (
                  <div
                    key={l}
                    className="rounded-xl bg-background/95 backdrop-blur border p-2.5 flex items-center gap-2"
                  >
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners strip */}
      <section className="border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground mb-6">
            {t("hero.partners")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {[
              `${t("marketing.susuShort")} · SUSU`,
              t("marketing.partnerSmartCity"),
              "Yandex Maps",
              "Mosgortrans",
              "ChelEnergo",
              t("marketing.partnerMobilityLab"),
            ].map((p) => (
              <div
                key={p}
                className="text-center font-semibold text-muted-foreground/80 tracking-wide text-xs sm:text-sm"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight max-w-2xl mx-auto">
            {t("hero.featuresTitle")}
          </h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Map, title: t("hero.f1Title"), body: t("hero.f1Body") },
              { icon: Zap, title: t("hero.f2Title"), body: t("hero.f2Body") },
              { icon: BarChart3, title: t("hero.f3Title"), body: t("hero.f3Body") },
              { icon: ShieldCheck, title: t("hero.f4Title"), body: t("hero.f4Body") },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border bg-card p-6 hover-elevate transition-shadow hover:shadow-lg"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
              {t("landing.testimonialsTitle")}
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">{t("landing.testimonialsSubtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((q, i) => (
              <motion.figure
                key={q.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border bg-card p-7 flex flex-col hover-elevate"
              >
                <Quote className="h-6 w-6 text-primary/40 mb-3" />
                <blockquote className="text-sm leading-relaxed text-foreground/90 flex-1">
                  "{q.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 pt-4 border-t">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {q.avatar}
                  </div>
                  <div className="leading-tight">
                    <div className="font-semibold text-sm">{q.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{q.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{t("hero.footerCta")}</h3>
            <p className="text-muted-foreground mt-3 text-lg">{t("hero.footerCtaSub")}</p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm">
              {[t("hero.f1Title"), t("hero.f2Title"), t("hero.f3Title"), t("hero.f4Title")].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex md:justify-end gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-6 gap-2">
                {t("hero.ctaPrimary")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-12 px-6">
                {t("marketing.navContact")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
