import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 1. 核心修改：将 BrowserRouter 替换为 HashRouter
import { HashRouter as Router, Routes, Route } from "react-router-dom"; 
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* 2. 核心修改：确保这里使用的是 Router (即 HashRouter) */}
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* 如果你有其他页面，比如 /about，也写在这里 */}
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
