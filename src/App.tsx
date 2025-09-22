import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import Index from "./pages/Index";
import { MailPage } from "./pages/mail/MailPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { DrivePage } from "./pages/drive/DrivePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mail" element={<MailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/drive" element={<DrivePage />} />
            {/* Placeholder routes for other modules */}
            <Route path="/notes" element={<div className="p-6"><h1 className="text-2xl font-semibold">Notes - Coming Soon</h1></div>} />
            <Route path="/connect" element={<div className="p-6"><h1 className="text-2xl font-semibold">Sebenza Connect - Coming Soon</h1></div>} />
            <Route path="/calendar" element={<div className="p-6"><h1 className="text-2xl font-semibold">Calendar - Coming Soon</h1></div>} />
            <Route path="/planner" element={<div className="p-6"><h1 className="text-2xl font-semibold">Planner - Coming Soon</h1></div>} />
            <Route path="/crm" element={<div className="p-6"><h1 className="text-2xl font-semibold">CRM - Coming Soon</h1></div>} />
            <Route path="/accounting" element={<div className="p-6"><h1 className="text-2xl font-semibold">Accounting - Coming Soon</h1></div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
