import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, Package, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/mypage', label: '마이페이지', icon: User, exact: true },
  { path: '/mypage/orders', label: '구매 내역', icon: Package },
  { path: '/mypage/sales', label: '판매 내역', icon: ShoppingBag },
  { path: '/mypage/wishlist', label: '위시리스트', icon: Heart },
  { path: '/mypage/settings', label: '설정', icon: Settings },
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <div className="mb-6">
              <p className="font-bold text-lg">{user.nickname}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

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
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-muted font-medium'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 mt-4 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </aside>

        {/* Mobile Menu */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
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
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
