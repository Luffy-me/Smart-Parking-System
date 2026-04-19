import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Zap, BatteryCharging, Activity, Clock } from "lucide-react";
import { format } from "date-fns";

type Bay = {
  id: string;
  code: string;
  status: "charging" | "idle" | "queued";
  power: number;
  energy: number;
  soc: number;
  vehicle?: string;
  startedAt?: Date;
};

const BAYS: Bay[] = [
  { id: "1", code: "EV-A1", status: "charging", power: 22, energy: 14.6, soc: 62, vehicle: "K477MT", startedAt: new Date(Date.now() - 42 * 60_000) },
  { id: "2", code: "EV-A2", status: "charging", power: 50, energy: 28.3, soc: 81, vehicle: "T201LO", startedAt: new Date(Date.now() - 78 * 60_000) },
  { id: "3", code: "EV-A3", status: "idle", power: 0, energy: 0, soc: 0 },
  { id: "4", code: "EV-B1", status: "charging", power: 11, energy: 6.2, soc: 34, vehicle: "M889AA", startedAt: new Date(Date.now() - 18 * 60_000) },
  { id: "5", code: "EV-B2", status: "queued", power: 0, energy: 0, soc: 0, vehicle: "P305VK" },
  { id: "6", code: "EV-B3", status: "idle", power: 0, energy: 0, soc: 0 },
  { id: "7", code: "EV-C1", status: "charging", power: 75, energy: 41.0, soc: 92, vehicle: "X011RR", startedAt: new Date(Date.now() - 95 * 60_000) },
  { id: "8", code: "EV-C2", status: "charging", power: 22, energy: 9.4, soc: 48, vehicle: "B210OP", startedAt: new Date(Date.now() - 27 * 60_000) },
];

const SESSIONS = [
  { id: "S-9821", bay: "EV-A2", plate: "T201LO", energy: 28.3, minutes: 78, status: "active" },
  { id: "S-9820", bay: "EV-C1", plate: "X011RR", energy: 41.0, minutes: 95, status: "active" },
  { id: "S-9819", bay: "EV-A1", plate: "G448HS", energy: 18.6, minutes: 56, status: "completed" },
  { id: "S-9818", bay: "EV-B1", plate: "L100AB", energy: 22.1, minutes: 64, status: "completed" },
  { id: "S-9817", bay: "EV-C2", plate: "Q872XL", energy: 9.7, minutes: 30, status: "completed" },
];

export default function EVCharging() {
  const { t } = useI18n();
  const totals = useMemo(() => {
    const charging = BAYS.filter((b) => b.status === "charging");
    return {
      active: charging.length,
      queued: BAYS.filter((b) => b.status === "queued").length,
      kwh: BAYS.reduce((a, b) => a + b.energy, 0),
      power: charging.reduce((a, b) => a + b.power, 0),
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("pages.evTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("pages.evSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("metrics.activeChargers"), value: `${totals.active}/${BAYS.length}`, icon: Zap, hint: `${totals.power} ${t("ev.kw")}` },
          { label: t("metrics.energyDelivered"), value: `${totals.kwh.toFixed(1)} ${t("ev.kwh")}`, icon: BatteryCharging, hint: t("ev.today") },
          { label: t("metrics.sessionsToday"), value: "127", icon: Activity, hint: t("ev.sessionsHint") },
          { label: t("metrics.avgSession"), value: "47m", icon: Clock, hint: `${t("ev.queued")}: ${totals.queued}` },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover-elevate">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{m.label}</span>
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold mt-2 tabular-nums">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.hint}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> {t("ev.stationsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BAYS.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`relative rounded-xl border p-4 ${
                    b.status === "charging" ? "border-primary/40 bg-primary/5" :
                    b.status === "queued" ? "border-amber-500/40 bg-amber-500/5" :
                    "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono font-bold tracking-wider text-sm">{b.code}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t("ev.bayLabel")} {b.id}</div>
                    </div>
                    <Badge variant="outline" className={
                      b.status === "charging" ? "bg-primary/10 text-primary border-primary/30" :
                      b.status === "queued" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                      "bg-muted text-muted-foreground"
                    }>
                      <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                        b.status === "charging" ? "bg-primary soft-pulse" :
                        b.status === "queued" ? "bg-amber-500" : "bg-muted-foreground"
                      }`} />
                      {t(`ev.${b.status}`)}
                    </Badge>
                  </div>
                  {b.status === "charging" ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold tabular-nums">{b.power}<span className="text-xs ml-1 text-muted-foreground">{t("ev.kw")}</span></div>
                        <div className="text-xs text-muted-foreground tabular-nums">{b.energy.toFixed(1)} {t("ev.kwh")}</div>
                      </div>
                      <Progress value={b.soc} className="h-1.5" />
                      <div className="flex justify-between text-xs">
                        <span className="font-mono">{b.vehicle}</span>
                        <span className="text-muted-foreground tabular-nums">{b.soc}%</span>
                      </div>
                    </div>
                  ) : b.status === "queued" ? (
                    <div className="mt-3 text-xs text-muted-foreground">{t("ev.nextUp")}: <span className="font-mono font-semibold text-foreground">{b.vehicle}</span></div>
                  ) : (
                    <div className="mt-3 text-xs text-muted-foreground">{t("ev.ready")}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> {t("ev.sessionsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SESSIONS.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate"
              >
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{s.id}</div>
                  <div className="text-sm font-semibold mt-0.5">{s.bay} · <span className="font-mono">{s.plate}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{s.energy.toFixed(1)} {t("ev.kwh")}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">{s.minutes}m · {s.status === "active" ? t("ev.active") : t("ev.completed")}</div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
