import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, MapPin, Sparkles, Building2, Cpu, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const HERO_IMG = "https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&w=1600&q=80";
const CITY_IMG = "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80";
const TECH_IMG = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80";

export default function About() {
  const { t } = useI18n();

  const milestones = [
    { year: t("about.m1Year"), title: t("about.m1Title"), body: t("about.m1Body") },
    { year: t("about.m2Year"), title: t("about.m2Title"), body: t("about.m2Body") },
    { year: t("about.m3Year"), title: t("about.m3Title"), body: t("about.m3Body") },
    { year: t("about.m4Year"), title: t("about.m4Title"), body: t("about.m4Body") },
  ];

  const sections = [
    { icon: Sparkles, title: t("about.missionTitle"), body: t("about.missionBody") },
    { icon: MapPin, title: t("about.whyTitle"), body: t("about.whyBody") },
    { icon: GraduationCap, title: t("about.universityTitle"), body: t("about.universityBody") },
    { icon: Building2, title: t("about.visionTitle"), body: t("about.visionBody") },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-background" />
        <div className="absolute inset-0 grid-bg opacity-[0.08]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-28 text-white">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary soft-pulse" /> {t("about.eyebrow")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-4xl"
          >
            {t("about.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-6 text-lg md:text-xl text-slate-200 max-w-3xl leading-relaxed"
          >
            {t("about.lead")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-sm">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {t("marketing.cityAvailable")}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-sm">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> {t("marketing.susuBadge")}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: "1,240+", l: t("about.statsLabel1") },
            { v: "8", l: t("about.statsLabel2") },
            { v: "32", l: t("about.statsLabel3") },
            { v: "5", l: t("about.statsLabel4") },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="text-3xl md:text-4xl font-bold tabular-nums tracking-tight text-gradient-teal">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Editorial sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border bg-card p-7 hover-elevate"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-xl tracking-tight">{s.title}</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Chelyabinsk image block */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${CITY_IMG})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold uppercase tracking-wider">
                <MapPin className="h-3 w-3" /> {t("marketing.cityCoords")}
              </div>
              <p className="mt-2 text-sm text-slate-200 max-w-md">{t("marketing.tagline")}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">{t("about.whyTitle")}</div>
            <h3 className="mt-3 text-3xl font-bold tracking-tight">{t("marketing.cityAvailable")}</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed text-lg">{t("about.whyBody")}</p>
          </motion.div>
        </div>
      </section>

      {/* Tech */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5" /> {t("about.techTitle")}
            </div>
            <h3 className="mt-3 text-3xl font-bold tracking-tight">{t("about.techTitle")}</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed text-lg">{t("about.techBody")}</p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { i: Radar, l: t("about.techBullet1") },
                { i: Cpu, l: t("about.techBullet2") },
                { i: MapPin, l: t("about.techBullet3") },
                { i: Sparkles, l: t("about.techBullet4") },
              ].map((it, i) => (
                <motion.li
                  key={it.l}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card text-sm"
                >
                  <it.i className="h-4 w-4 text-primary" /> {it.l}
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${TECH_IMG})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/30 via-slate-950/40 to-slate-950/80 mix-blend-multiply" />
            <div className="absolute inset-0 grid-bg opacity-25" />
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30 border-t">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("about.timelineTitle")}</h2>
            <p className="text-muted-foreground mt-3 text-lg">{t("about.timelineSubtitle")}</p>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent md:-translate-x-px" />
            <div className="flex flex-col gap-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year + m.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex md:items-center gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-2 md:top-1/2 md:-translate-y-1/2">
                    <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-background shadow-lg shadow-primary/40" />
                  </div>
                  <div className="md:w-1/2 pl-12 md:px-8">
                    <div className="inline-block rounded-full px-3 py-1 text-xs font-semibold tabular-nums bg-primary/10 text-primary border border-primary/20">
                      {m.year}
                    </div>
                    <h4 className="mt-2 text-xl font-bold tracking-tight">{m.title}</h4>
                    <p className="mt-1.5 text-muted-foreground leading-relaxed">{m.body}</p>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{t("about.ctaTitle")}</h3>
            <p className="text-muted-foreground mt-3 text-lg">{t("about.ctaBody")}</p>
          </div>
          <div className="flex md:justify-end">
            <Link href="/contact">
              <Button size="lg" className="h-12 px-6 gap-2">
                {t("about.ctaButton")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
