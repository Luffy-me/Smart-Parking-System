import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Pricing() {
  const { t } = useI18n();
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      tagline: t("pricing.starterTagline"),
      monthly: 49,
      annual: 39,
      cta: t("common.getStarted"),
      featured: false,
      features: ["Up to 50 spots", "Live occupancy map", "Basic analytics", "Email support", "1 operator seat"],
    },
    {
      name: "Pro",
      tagline: t("pricing.proTagline"),
      monthly: 199,
      annual: 159,
      cta: t("common.getStarted"),
      featured: true,
      features: ["Up to 500 spots", "Advanced analytics & exports", "5 operator seats", "Priority support", "Custom branding", "API access"],
    },
    {
      name: "Enterprise",
      tagline: t("pricing.enterpriseTagline"),
      monthly: null,
      annual: null,
      cta: t("common.contactSales"),
      featured: false,
      features: ["Unlimited spots & zones", "SSO & audit trail", "SLA & 24/7 support", "Dedicated CSM", "On-prem & private cloud", "API & webhooks"],
    },
  ];

  const handleClick = (planName: string) => {
    toast.success(`${planName}: ${t("pricing.simulatedToast")}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center max-w-2xl mx-auto pt-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("pages.pricingTitle")}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{t("pages.pricingSubtitle")}</p>
        <div className="mt-6 inline-flex items-center gap-3 p-1.5 rounded-full border bg-card">
          <button onClick={() => setAnnual(false)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t("pricing.monthly")}</button>
          <button onClick={() => setAnnual(true)} className={`px-4 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1.5 ${annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            {t("pricing.annual")} <span className="text-[10px] uppercase tracking-wider">−20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto w-full">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={p.featured ? "md:-mt-4" : ""}
          >
            <Card className={`relative h-full ${p.featured ? "border-primary shadow-xl ring-1 ring-primary/30" : ""}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground gap-1 px-3 py-1"><Sparkles className="h-3 w-3" /> {t("common.mostPopular")}</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">{p.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{p.tagline}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-baseline gap-1">
                  {p.monthly === null ? (
                    <span className="text-4xl font-bold tracking-tight">{t("pricing.custom")}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold tracking-tight tabular-nums">${annual ? p.annual : p.monthly}</span>
                      <span className="text-sm text-muted-foreground">{t("common.perMonth")}</span>
                    </>
                  )}
                </div>
                <Button
                  className="w-full"
                  variant={p.featured ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleClick(p.name)}
                >
                  {p.cta}
                </Button>
                <ul className="space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
