import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Reading from "./pages/Reading";
import CardLibrary from "./pages/CardLibrary";
import History from "./pages/History";
import ParticleBackground from "./components/ParticleBackground";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reading" component={Reading} />
      <Route path="/cards" component={CardLibrary} />
      <Route path="/history" component={History} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            toastOptions={{
              style: {
                background: "#111",
                border: "1px solid #c9a84c",
                color: "#e8d5a3",
                fontFamily: "'EB Garamond', serif",
              },
            }}
          />
          <ParticleBackground />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
