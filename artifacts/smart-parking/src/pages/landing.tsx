import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Map, CalendarRange, CarFront, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Map className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Parq</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Smarter parking for drivers and operators.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Reserve a spot in seconds, manage your vehicles, and track every
              session — all in one place.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/sign-up">
                <Button size="lg">Create an account</Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline">Sign in</Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: CalendarRange, label: "Live reservations" },
              { icon: CarFront, label: "Vehicle profiles" },
              { icon: Map, label: "Real-time map" },
              { icon: ShieldCheck, label: "Operator controls" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border bg-card p-5 flex flex-col gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
