import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { MyPageLayout } from "@/pages/mypage/MyPageLayout";

// Public Pages
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import NotFound from "@/pages/NotFound";

// Private Pages
import { BuyPage } from "@/pages/BuyPage";
import { SellPage } from "@/pages/SellPage";

// MyPage Pages
import { MyPageHome } from "@/pages/mypage/MyPageHome";
import { OrdersPage } from "@/pages/mypage/OrdersPage";
import { SalesPage } from "@/pages/mypage/SalesPage";
import { WishlistPage } from "@/pages/mypage/WishlistPage";
import { SettingsPage } from "@/pages/mypage/SettingsPage";

// Admin Pages
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { StaffManagementPage } from "@/pages/admin/StaffManagementPage";
import { BrandManagementPage } from "@/pages/admin/BrandManagementPage";
import { ProductManagementPage } from "@/pages/admin/ProductManagementPage";
import { OrderInspectionPage } from "@/pages/admin/OrderInspectionPage";

const queryClient = new QueryClient();

// Route Guards
const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => {
  const { isAuthenticated, adminRole, isLoading } = useAuth();

  if (isLoading) return null;

  const hasAdminRole = adminRole && ['ROLE_MASTER', 'ROLE_MANAGER', 'ROLE_INSPECTOR'].includes(adminRole);

  if (!isAuthenticated || !hasAdminRole) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              
              {/* Private Routes needing MainLayout */}
              <Route element={<PrivateRoute />}>
                <Route path="/buy/:productId" element={<BuyPage />} />
                <Route path="/sell" element={<SellPage />} />
                <Route path="/sell/:productId" element={<SellPage />} />
              </Route>
            </Route>

            {/* MyPage Routes (Has its own Layout) */}
            <Route element={<PrivateRoute />}>
              <Route path="/mypage" element={<MyPageLayout />}>
                <Route index element={<MyPageHome />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="staff" element={<StaffManagementPage />} />
                <Route path="brands" element={<BrandManagementPage />} />
                <Route path="products" element={<ProductManagementPage />} />
                <Route path="orders" element={<OrderInspectionPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
