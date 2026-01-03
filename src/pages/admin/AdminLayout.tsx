import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Tags, 
  ClipboardCheck, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ADMIN_ROLE_MAP } from '@/types';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { 
    path: '/admin', 
    label: '대시보드', 
    icon: LayoutDashboard,
    roles: ['ROLE_MASTER', 'ROLE_MANAGER', 'ROLE_INSPECTOR']
  },
  { 
    path: '/admin/staff', 
    label: '스태프 관리', 
    icon: Users,
    roles: ['ROLE_MASTER']
  },
  { 
    path: '/admin/brands', 
    label: '브랜드 관리', 
    icon: Tags,
    roles: ['ROLE_MASTER', 'ROLE_MANAGER']
  },
  { 
    path: '/admin/products', 
    label: '상품 관리', 
    icon: Package,
    roles: ['ROLE_MASTER', 'ROLE_MANAGER']
  },
  { 
    path: '/admin/orders', 
    label: '주문 검수', 
    icon: ClipboardCheck,
    roles: ['ROLE_MASTER', 'ROLE_INSPECTOR']
  },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading, isAdmin, adminRole } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isLoading, isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const filteredMenuItems = menuItems.filter((item) => 
    adminRole && item.roles.includes(adminRole)
  );

  if (isLoading || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold tracking-tighter">
            UNBOX
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-background border-r border-border transition-transform',
            'md:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <Link to="/admin" className="hidden md:block text-xl font-bold tracking-tighter mb-8 px-3">
              UNBOX
            </Link>

            {/* User Info */}
            <div className="px-3 py-4 mb-4 bg-muted rounded-lg">
              <p className="font-medium">{user.nickname}</p>
              <p className="text-xs text-muted-foreground">
                {adminRole ? ADMIN_ROLE_MAP[adminRole] : '관리자'}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive = item.path === '/admin' 
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-foreground text-background'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <Button
              variant="ghost"
              className="justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
