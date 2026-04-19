import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { User, Bell, SlidersHorizontal, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { data: user } = useGetCurrentUser();
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [org, setOrg] = useState("Parq Operations");
  const [tz, setTz] = useState("Europe/Moscow");
  const [currency, setCurrency] = useState("USD");

  const sections = [
    {
      icon: User,
      title: t("settings.account"),
      content: (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
          <div className="space-y-2"><Label>Role</Label><Input value={user?.role ?? ""} disabled className="capitalize" /></div>
        </div>
      ),
    },
    {
      icon: SlidersHorizontal,
      title: t("settings.preferences"),
      content: (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("common.language")}</Label>
            <Select value={lang} onValueChange={(v) => setLang(v as "en" | "ru")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("common.theme")}</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("common.lightMode")}</SelectItem>
                <SelectItem value="dark">{t("common.darkMode")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      icon: Bell,
      title: t("settings.notifications"),
      content: (
        <div className="divide-y">
          {[
            { label: t("settings.emailAlerts"), value: email, set: setEmail },
            { label: t("settings.pushAlerts"), value: push, set: setPush },
            { label: t("settings.smsAlerts"), value: sms, set: setSms },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">{row.label}</span>
              <Switch checked={row.value} onCheckedChange={row.set} />
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Building2,
      title: t("settings.operatorProfile"),
      content: (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2 sm:col-span-3"><Label>{t("settings.organizationName")}</Label><Input value={org} onChange={(e) => setOrg(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>{t("settings.timezone")}</Label>
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("settings.currency")}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD $</SelectItem>
                <SelectItem value="EUR">EUR €</SelectItem>
                <SelectItem value="RUB">RUB ₽</SelectItem>
                <SelectItem value="GBP">GBP £</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.settingsTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.settingsSubtitle")}</p>
        </div>
        <Button onClick={() => toast.success("Settings saved")}>{t("settings.save")}</Button>
      </div>

      <div className="grid grid-cols-1 gap-5 max-w-4xl">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <s.icon className="h-4 w-4 text-primary" /> {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>{s.content}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
