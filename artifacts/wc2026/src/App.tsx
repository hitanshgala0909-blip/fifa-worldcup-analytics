import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Bracket from "@/pages/Bracket";
import Teams from "@/pages/Teams";
import Players from "@/pages/Players";
import Fantasy from "@/pages/Fantasy";
import Intelligence from "@/pages/Intelligence";
import Groups from "@/pages/Groups";
import Predictor from "@/pages/Predictor";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bracket" component={Bracket} />
        <Route path="/groups" component={Groups} />
        <Route path="/teams" component={Teams} />
        <Route path="/players" component={Players} />
        <Route path="/fantasy" component={Fantasy} />
        <Route path="/intelligence" component={Intelligence} />
        <Route path="/predictor" component={Predictor} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
