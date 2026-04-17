import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardV2 from "./pages/DashboardV2";
import AssetPerformance from "./pages/AssetPerformance";
import Trading from "./pages/Trading";
import Portfolio from "./pages/Portfolio";
import BinancePositions from "./pages/BinancePositions";
import Calendar from "./pages/Calendar";
import UserSettings from "./pages/UserSettings";
import AddBroker from "./pages/AddBroker";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoadingScreen from "./pages/LoadingScreen";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import UserManagement from "./pages/admin/UserManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import ConfigManagement from "./pages/admin/ConfigManagement";
import AssetsManagement from "./pages/admin/AssetsManagement";
import AuditLogs from "./pages/admin/AuditLogs";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import SupportedAssets from "./pages/SupportedAssets";
import PositionsV2 from "./pages/PositionsV2";
import PublicSignals from "./pages/PublicSignals";
import StrategyMarketplace from "./pages/StrategyMarketplace";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BinanceTutorial from "./pages/BinanceTutorial";
import RegisterV2 from "./pages/RegisterV2";
import AffiliateVerifications from "./pages/admin/AffiliateVerifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Admin Routes - Must be before other routes */}
          <Route path="/admin/:adminCode/login" element={<AdminLogin />} />
          <Route path="/admin/:adminCode/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/:adminCode/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/:adminCode/users" element={<UserManagement />} />
          <Route path="/admin/:adminCode/settings" element={<AdminSettings />} />
          <Route path="/admin/:adminCode/config" element={<ConfigManagement />} />
          <Route path="/admin/:adminCode/logs" element={<AuditLogs />} />
          <Route path="/admin/:adminCode/assets" element={<AssetsManagement />} />
          <Route path="/admin/:adminCode/affiliates" element={<AffiliateVerifications />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="trading" element={<Trading />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="binance-positions" element={<BinancePositions />} />
            <Route path="supported-assets" element={<SupportedAssets />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="user-settings" element={<UserSettings />} />
            <Route path="add-broker" element={<AddBroker />} />
          </Route>
          <Route path="/dashboard-v2" element={<ProtectedRoute><DashboardV2 /></ProtectedRoute>} />
          <Route path="/positions" element={<ProtectedRoute><PositionsV2 /></ProtectedRoute>} />
          <Route path="/asset-performance" element={<ProtectedRoute><AssetPerformance /></ProtectedRoute>} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterV2 />} />
          <Route path="/register-old" element={<Register />} />
          <Route path="/signals" element={<PublicSignals />} />
          <Route path="/marketplace" element={<StrategyMarketplace />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/binance-tutorial" element={<BinanceTutorial />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
