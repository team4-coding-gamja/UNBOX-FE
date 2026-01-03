import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, Package, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const menuItems = [
  { path: '/mypage', label: '사용자 프로필', icon: User, exact: true },
  { path: '/mypage/orders', label: '구매 내역', icon: Package },
  { path: '/mypage/sales', label: '판매 내역', icon: ShoppingBag },
  { path: '/mypage/wishlist', label: '관심 상품', icon: Heart },
  { path: '/mypage/settings', label: '프로필 관리', icon: Settings },
];

export function MyPageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-10 md:gap-16">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-6">마이 페이지</h2>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = item.exact
                      ? location.pathname === item.path
                      : location.pathname.startsWith(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'flex items-center justify-between px-2 py-3 text-[15px] transition-colors',
                          isActive
                            ? 'font-bold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-8 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 h-auto py-2 text-muted-foreground hover:text-destructive text-[13px]"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Menu (Horizontally Scrollable) */}
          <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide mb-6">
            <div className="flex gap-2">
              {menuItems.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                      isActive
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <section className="min-h-[500px]">
            <Outlet />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
