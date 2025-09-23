import React from "react";
import { Toaster } from "@/components/ui/Toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./routes/AllRoutes";
import { AuthProvider } from "./context/AuthContext";
// import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider } from "./context/DataContext";
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* <ThemeProvider> */}
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <AllRoutes />
              <Toaster />
              <HotToaster />
              <Sonner />
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
        {/* </ThemeProvider> */}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
