import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LineChart, Line } from "recharts";
import { TrendingUp, Clock, Flame, Filter } from "lucide-react";

const HOURLY = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  occupancy: Math.round(30 + 50 * Math.sin((h - 6) / 24 * Math.PI * 2) + (h >= 8 && h <= 19 ? 18 : 0) + Math.random() * 8),
}));

const DURATION_BY_TYPE = [
  { type: "Standard", minutes: 84 },
  { type: "Compact", minutes: 67 },
  { type: "Accessible", minutes: 96 },
  { type: "Motorcycle", minutes: 41 },
];

const ZONE_REVENUE = [
  { zone: "A", revenue: 3420, sessions: 412 },
  { zone: "B", revenue: 2810, sessions: 358 },
  { zone: "C", revenue: 4180, sessions: 467 },
  { zone: "D", revenue: 1990, sessions: 244 },
  { zone: "E", revenue: 3060, sessions: 380 },
];

const PEAK_INSIGHTS: { labelKey: "morningPeak" | "lunchSurge" | "eveningPeak" | "lateNightLow"; time: string; load: number; tone: string }[] = [
  { labelKey: "morningPeak", time: "08:00 – 10:00", load: 92, tone: "primary" },
  { labelKey: "lunchSurge", time: "12:30 – 13:30", load: 78, tone: "chart-2" },
  { labelKey: "eveningPeak", time: "17:30 – 19:30", load: 96, tone: "primary" },
  { labelKey: "lateNightLow", time: "01:00 – 05:00", load: 14, tone: "muted-foreground" },
];

export default function Analytics() {
  const { t } = useI18n();
  const [range, setRange] = useState("7d");
  const [zone, setZone] = useState("all");
  const [type, setType] = useState("all");

  const tooltip = {
    contentStyle: { backgroundColor: "hsl(var(--card))", borderRadius: 8, border: "1px solid hsl(var(--border))" },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.analyticsTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.analyticsSubtitle")}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mr-2">{t("analytics.filtersTitle")}</span>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{t("analytics.range24h")}</SelectItem>
              <SelectItem value="7d">{t("analytics.range7d")}</SelectItem>
              <SelectItem value="30d">{t("analytics.range30d")}</SelectItem>
              <SelectItem value="90d">{t("analytics.range90d")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allZones")}</SelectItem>
              {ZONE_REVENUE.map((z) => <SelectItem key={z.zone} value={z.zone}>{t("slotGrid.zone")} {z.zone}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("analytics.allTypes")}</SelectItem>
              {DURATION_BY_TYPE.map((d) => <SelectItem key={d.type} value={d.type}>{d.type}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t("metrics.peakHour"), value: "18:00", hint: t("analytics.peakHourHint"), icon: Flame },
          { label: t("metrics.avgDuration"), value: "84m", hint: t("analytics.avgDurationHint"), icon: Clock },
          { label: t("analytics.conversion"), value: "78.4%", hint: t("analytics.conversionHint"), icon: TrendingUp },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover-elevate">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{m.label}</span>
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-3xl font-bold mt-2 tabular-nums">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.hint}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t("analytics.hourlyOccupancy")}</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <Tooltip {...tooltip} formatter={(v: number) => [`${v}%`, "Occupancy"]} />
                <Area type="monotone" dataKey="occupancy" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#occGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("analytics.peakInsights")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {PEAK_INSIGHTS.map((p, i) => (
              <motion.div key={p.labelKey} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">{t(`analytics.${p.labelKey}` as const)}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">{p.time}</div>
                  </div>
                  <Badge variant="outline" className="tabular-nums">{p.load}%</Badge>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.load}%`, backgroundColor: `hsl(var(--${p.tone}))` }} />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t("analytics.zoneRevenue")}</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ZONE_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="zone" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip {...tooltip} formatter={(v: number) => [`$${v}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("analytics.durationByType")}</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DURATION_BY_TYPE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="m" />
                <Tooltip {...tooltip} formatter={(v: number) => [`${v} min`, "Avg duration"]} />
                <Line type="monotone" dataKey="minutes" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ r: 5, fill: "hsl(var(--chart-2))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
