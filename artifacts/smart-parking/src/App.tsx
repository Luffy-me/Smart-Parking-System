import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";

import Dashboard from "@/pages/dashboard";
import LiveMap from "@/pages/map";
import Reservations from "@/pages/reservations";
import Vehicles from "@/pages/vehicles";
import Transactions from "@/pages/transactions";
import SpotsAdmin from "@/pages/spots";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/map" component={LiveMap} />
        <Route path="/reservations" component={Reservations} />
        <Route path="/vehicles" component={Vehicles} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/spots" component={SpotsAdmin} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;