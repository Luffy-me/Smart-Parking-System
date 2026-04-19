import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
} from "@clerk/react";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useGetCurrentUser,
  type CurrentUser,
} from "@workspace/api-client-react";
import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

import Landing from "@/pages/landing";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import Dashboard from "@/pages/dashboard";
import LiveMap from "@/pages/map";
import Reservations from "@/pages/reservations";
import Vehicles from "@/pages/vehicles";
import Transactions from "@/pages/transactions";
import SpotsAdmin from "@/pages/spots";
import EVCharging from "@/pages/ev-charging";
import Analytics from "@/pages/analytics";
import Pricing from "@/pages/pricing";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

const clerkAppearance = {
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(173, 80%, 36%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInputBackground: "hsl(0, 0%, 100%)",
    colorText: "hsl(222, 47%, 11%)",
    colorTextSecondary: "hsl(215, 16%, 47%)",
    colorInputText: "hsl(222, 47%, 11%)",
    colorNeutral: "hsl(222, 47%, 11%)",
    borderRadius: "0.75rem",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.95rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox:
      "rounded-2xl w-full overflow-hidden border border-border shadow-xl bg-card",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer:
      "!shadow-none !border-0 !bg-transparent !rounded-none border-t border-border",
    headerTitle: "text-xl font-bold",
    headerSubtitle: "text-sm",
    socialButtonsBlockButtonText: "text-sm font-medium",
    formFieldLabel: "text-sm font-medium",
    footerActionLink: "font-medium",
    footerActionText: "text-sm",
    dividerText: "text-xs uppercase tracking-wider",
    identityPreviewEditButton: "text-sm",
    formFieldSuccessText: "text-xs",
    alertText: "text-sm",
    logoBox: "flex justify-center mb-2",
    logoImage: "h-12 w-12",
    socialButtonsBlockButton:
      "border border-border hover:bg-muted transition-colors rounded-xl",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium normal-case",
    formFieldInput:
      "border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20",
    footerAction: "py-3",
    dividerLine: "bg-border",
    alert: "rounded-xl border border-border",
    otpCodeFieldInput: "border border-border rounded-lg",
    formFieldRow: "space-y-2",
    main: "gap-4",
  },
};

const clerkElementStyles = {
  headerTitle: { color: "hsl(222, 47%, 11%)" },
  headerSubtitle: { color: "hsl(215, 16%, 47%)" },
  socialButtonsBlockButtonText: { color: "hsl(222, 47%, 11%)" },
  formFieldLabel: { color: "hsl(222, 47%, 11%)" },
  footerActionText: { color: "hsl(215, 16%, 47%)" },
  footerActionLink: { color: "hsl(173, 80%, 36%)" },
  dividerText: { color: "hsl(215, 16%, 47%)" },
  identityPreviewEditButton: { color: "hsl(173, 80%, 36%)" },
  formFieldSuccessText: { color: "hsl(142, 71%, 45%)" },
  alertText: { color: "hsl(0, 84%, 60%)" },
};

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          appearance={{ elements: clerkElementStyles }}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          appearance={{ elements: clerkElementStyles }}
        />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <SignedInHome />
      </Show>
      <Show when="signed-out">
        <MarketingLayout>
          <Landing />
        </MarketingLayout>
      </Show>
    </>
  );
}

function PublicAboutPage() {
  return (
    <MarketingLayout>
      <About />
    </MarketingLayout>
  );
}

function PublicContactPage() {
  return (
    <MarketingLayout>
      <Contact />
    </MarketingLayout>
  );
}

function PublicPricingPage() {
  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Pricing />
      </div>
    </MarketingLayout>
  );
}

function SignedInHome() {
  const { data: user, isLoading } = useGetCurrentUser();
  if (isLoading || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  return user.role === "operator" ? (
    <Redirect to="/dashboard" />
  ) : (
    <Redirect to="/reservations" />
  );
}

function ProtectedApp({
  children,
  operatorOnly,
}: {
  children: (user: CurrentUser) => React.ReactNode;
  operatorOnly?: boolean;
}) {
  const { data: user, isLoading } = useGetCurrentUser();
  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) return <Redirect to="/" />;
  if (operatorOnly && user.role !== "operator")
    return <Redirect to="/reservations" />;
  return <>{children(user)}</>;
}

function ProtectedRoutes() {
  return (
    <ProtectedApp>
      {(user) => (
        <AppShell user={user}>
          <Switch>
            <Route path="/dashboard">
              <ProtectedApp operatorOnly>{() => <Dashboard />}</ProtectedApp>
            </Route>
            <Route path="/map" component={LiveMap} />
            <Route path="/reservations" component={Reservations} />
            <Route path="/vehicles" component={Vehicles} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/spots">
              <ProtectedApp operatorOnly>{() => <SpotsAdmin />}</ProtectedApp>
            </Route>
            <Route path="/ev-charging" component={EVCharging} />
            <Route path="/analytics">
              <ProtectedApp operatorOnly>{() => <Analytics />}</ProtectedApp>
            </Route>
            <Route path="/pricing" component={Pricing} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </AppShell>
      )}
    </ProtectedApp>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/about" component={PublicAboutPage} />
      <Route path="/contact" component={PublicContactPage} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route>
        <Show when="signed-in">
          <ProtectedRoutes />
        </Show>
        <Show when="signed-out">
          <Switch>
            <Route path="/pricing" component={PublicPricingPage} />
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </Show>
      </Route>
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to continue to Parq",
          },
        },
        signUp: {
          start: {
            title: "Create your Parq account",
            subtitle: "Reserve and manage parking in seconds",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider>
          <I18nProvider>
            <TooltipProvider>
              <MotionConfig reducedMotion="user">
                <AppRoutes />
                <Toaster />
                <SonnerToaster />
              </MotionConfig>
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
