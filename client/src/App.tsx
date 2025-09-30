import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { SEOTracker } from "./components/seo/seo-tracker";
import { PageLoader } from "./components/ui/loading";
import "./lib/i18n";

// Lazy load components
const Home = lazy(() => import("./pages/home"));
const About = lazy(() => import("./pages/about"));
const Services = lazy(() => import("./pages/services"));
const Contact = lazy(() => import("./pages/contact"));
const FAQ = lazy(() => import("./pages/faq"));
const NotFound = lazy(() => import("./pages/not-found"));
const Blogs = lazy(() => import("./pages/blogs"));
const BlogPost = lazy(() => import("./pages/blog-post"));
const Admin = lazy(() => {
  console.log('[DEBUG] Lazy loading Admin component');
  return import("./pages/admin");
});
const ClientPortal = lazy(() => import("./pages/client-portal"));
const ClientDashboard = lazy(() => import("./pages/client-dashboard"));
const ClientConsultations = lazy(() => import("./pages/client-consultations"));
const ClientDocuments = lazy(() => import("./pages/client-documents"));
const ClientMessages = lazy(() => import("./pages/client-messages"));
const ClientInvoices = lazy(() => import("./pages/client-invoices"));
const ClientResources = lazy(() => import("./pages/client-resources"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/blogs" component={Blogs} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/admin" component={Admin} />
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/client/consultations" component={ClientConsultations} />
      <Route path="/client/documents" component={ClientDocuments} />
      <Route path="/client/messages" component={ClientMessages} />
      <Route path="/client/invoices" component={ClientInvoices} />
      <Route path="/client/resources" component={ClientResources} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={<PageLoader />}>
          <SEOTracker />
          <Toaster />
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
