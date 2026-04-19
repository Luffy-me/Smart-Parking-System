import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Map, 
  CalendarRange, 
  CarFront, 
  Receipt, 
  Settings2,
  Menu,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/reservations", label: "Reservations", icon: CalendarRange },
  { href: "/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/spots", label: "Spots Admin", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <a
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </a>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Map className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Parq</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <div className="flex items-center gap-2 mb-8 mt-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Map className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Parq</span>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Map className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Parq</span>
        </div>
        <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border">
              <span className="text-sm font-medium">OP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Operator</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="hidden md:flex h-16 items-center justify-end px-8 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}