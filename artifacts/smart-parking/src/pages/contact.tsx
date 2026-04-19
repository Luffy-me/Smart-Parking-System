import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, GraduationCap, MapPin, Microscope, CheckCircle2, AlertCircle, Mail, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    org: "",
    topic: "general",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 1100));
    // Simulated network — always succeeds for predictable demos.
    const ok = true;
    if (ok) {
      setStatus("success");
      toast.success(t("contact.successTitle"));
      // eslint-disable-next-line no-console
      console.info("[contact] simulated submission", form);
    } else {
      setStatus("error");
      toast.error(t("contact.errorTitle"));
    }
  };

  const reset = () => {
    setForm({ name: "", email: "", org: "", topic: "general", message: "" });
    setStatus("idle");
  };

  const cards = [
    {
      icon: GraduationCap,
      title: t("contact.susuTitle"),
      body: t("contact.susuBody"),
    },
    {
      icon: MapPin,
      title: t("contact.cityTitle"),
      body: t("contact.cityBody"),
    },
    {
      icon: Microscope,
      title: t("contact.collabTitle"),
      body: t("contact.collabBody"),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-12">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium uppercase tracking-wider"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary soft-pulse" /> {t("contact.eyebrow")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl"
          >
            {t("contact.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 text-lg text-muted-foreground max-w-2xl"
          >
            {t("contact.lead")}
          </motion.p>
        </div>
      </section>

      {/* Form + cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 rounded-2xl border bg-card p-6 md:p-8 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight">{t("contact.formTitle")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("contact.formSubtitle")}</p>
            </div>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center py-10"
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold">{t("contact.successTitle")}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">{t("contact.successBody")}</p>
                  <Button variant="outline" className="mt-6" onClick={reset}>
                    {t("contact.anotherMessage")}
                  </Button>
                </motion.div>
              ) : status === "error" ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center py-10"
                >
                  <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold">{t("contact.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">{t("contact.errorBody")}</p>
                  <Button className="mt-6" onClick={() => setStatus("idle")}>
                    {t("contact.anotherMessage")}
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contact.name")}</Label>
                      <Input
                        id="name"
                        required
                        placeholder={t("contact.namePlaceholder")}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contact.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder={t("contact.emailPlaceholder")}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org">{t("contact.org")}</Label>
                      <Input
                        id="org"
                        placeholder={t("contact.orgPlaceholder")}
                        value={form.org}
                        onChange={(e) => setForm({ ...form, org: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topic">{t("contact.topic")}</Label>
                      <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                        <SelectTrigger id="topic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">{t("contact.topicGeneral")}</SelectItem>
                          <SelectItem value="collab">{t("contact.topicCollab")}</SelectItem>
                          <SelectItem value="operator">{t("contact.topicOperator")}</SelectItem>
                          <SelectItem value="student">{t("contact.topicStudent")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("contact.message")}</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      placeholder={t("contact.messagePlaceholder")}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {t("contact.responseValue")}
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="gap-2 min-w-[160px]"
                      disabled={status === "submitting"}
                    >
                      {status === "submitting" ? (
                        <>
                          <span className="h-3 w-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                          {t("contact.submitting")}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> {t("contact.submit")}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {cards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border bg-card p-6 hover-elevate"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold tracking-tight">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
            <div className="rounded-2xl border bg-muted/40 p-6 text-sm">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("footer.emailLabel")}</div>
                    <div className="font-medium">{t("footer.emailValue")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("footer.phoneLabel")}</div>
                    <div className="font-medium">{t("footer.phoneValue")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("contact.hoursLabel")}</div>
                    <div className="font-medium">{t("contact.hoursValue")}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("footer.addressLabel")}</div>
                    <div className="font-medium leading-snug">{t("footer.addressLine")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
