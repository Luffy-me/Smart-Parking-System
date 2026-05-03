import { useGetDashboardSummary, useGetRevenueTrend, useGetZoneBreakdown, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Car, Map, CalendarRange, DollarSign, Activity, AlertCircle, Flame, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useI18n();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: trend, isLoading: isLoadingTrend } = useGetRevenueTrend();
  const { data: zones, isLoading: isLoadingZones } = useGetZoneBreakdown();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.dashboardTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.dashboardSubtitle")}</p>
        </div>
      </div>

      {isLoadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : summary ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.revenueToday")}</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">${summary.revenueToday.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Week: ${summary.revenueWeek.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.utilization")}</CardTitle>
                <Map className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{(summary.utilizationRate * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {summary.occupiedSpots} occupied / {summary.totalSpots} total
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.activeReservations")}</CardTitle>
                <CalendarRange className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{summary.activeReservations}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.reservedSpots} spots marked reserved
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.registeredVehicles")}</CardTitle>
                <Car className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{summary.totalVehicles}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.availableSpots} spots available now
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("metrics.revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingTrend ? (
              <Skeleton className="w-full h-full" />
            ) : trend && trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => format(new Date(val), "MMM d")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(val) => `$${val}`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelFormatter={(val) => format(new Date(val), "MMM d, yyyy")}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <DollarSign className="h-10 w-10 mb-2 opacity-20" />
                <p>No revenue data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("metrics.recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-y-auto pr-2">
            {isLoadingActivity ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activity.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                      {item.kind === "reservation_created" ? <CalendarRange className="w-4 h-4 text-primary" /> :
                       item.kind === "spot_occupied" ? <Car className="w-4 h-4 text-destructive" /> :
                       item.kind === "spot_freed" ? <Map className="w-4 h-4 text-emerald-500" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border bg-card shadow-sm hover-elevate">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{item.kind.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <time className="text-xs text-muted-foreground">{format(new Date(item.at), "HH:mm")}</time>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.message}
                        {item.spotCode && <span className="ml-1 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">{item.spotCode}</span>}
                        {item.vehiclePlate && <span className="ml-1 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">{item.vehiclePlate}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Activity className="h-10 w-10 mb-2 opacity-20" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("metrics.zoneUtilization")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
          {isLoadingZones ? (
            <Skeleton className="w-full h-full" />
          ) : zones && zones.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zones} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="zone" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                />
                <Bar dataKey="occupied" name="Occupied" stackId="a" fill="hsl(var(--destructive))" radius={[0, 0, 4, 4]} />
                <Bar dataKey="reserved" name="Reserved" stackId="a" fill="hsl(var(--chart-4))" />
                <Bar dataKey="available" name="Available" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Map className="h-10 w-10 mb-2 opacity-20" />
              <p>No zone data</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-primary" /> {t("metrics.alerts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(() => {
            const alerts = [];
            if (summary) {
              const pct = (summary.utilizationRate * 100).toFixed(0);
              alerts.push({
                icon: Flame,
                tone: Number(pct) > 80 ? "destructive" : "primary",
                title: t("metrics.utilization"),
                value: `${pct}%`,
                body: Number(pct) > 80 ? t("alerts.peakBody") : t("alerts.durationBody"),
              });
            }
            if (summary && summary.maintenanceSpots > 0) {
              alerts.push({
                icon: AlertCircle,
                tone: "destructive",
                title: t("alerts.maintenanceOverdue"),
                value: `${summary.maintenanceSpots} spot(s)`,
                body: t("alerts.maintenanceBody"),
              });
            }
            if (summary) {
              alerts.push({
                icon: TrendingUp,
                tone: "primary",
                title: t("metrics.activeReservations"),
                value: `${summary.activeReservations}`,
                body: `${summary.reservedSpots} spots reserved out of ${summary.totalSpots} total.`,
              });
            }
            if (alerts.length === 0) {
              alerts.push({
                icon: TrendingUp,
                tone: "primary",
                title: t("metrics.alerts"),
                value: "—",
                body: "No alerts at this time.",
              });
            }
            return alerts;
          })().map((a, i) => (
            <motion.div key={a.title + i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover-elevate">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0`} style={{ backgroundColor: `hsl(var(--${a.tone}) / .12)`, color: `hsl(var(--${a.tone}))` }}>
                <a.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{a.title}</span>
                  <Badge variant="outline" className="tabular-nums text-[10px]">{a.value}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}