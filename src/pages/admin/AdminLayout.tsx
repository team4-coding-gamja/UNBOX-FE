import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Tags, 
  ClipboardList, 
  LogOut,
  Menu,
  X,
  UserCircle,
  Inbox
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ADMIN_ROLE_MAP } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    path: '/admin/users',
    label: '회원 관리',
    icon: UserCircle,
    roles: ['ROLE_MASTER', 'ROLE_MANAGER']
  },
  {
    path: '/admin/product-requests',
    label: '상품 요청',
    icon: Inbox,
    roles: ['ROLE_MASTER', 'ROLE_MANAGER']
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
    icon: ClipboardList,
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-black text-white px-4 py-3 flex items-center justify-between shadow-md">
        <Link to="/admin" className="text-lg font-black tracking-tighter">
          UNBOX <span className="text-xs font-normal opacity-70 ml-1">ADMIN</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-black text-white transform transition-transform duration-300 md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full border-r border-white/10">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <Link to="/admin" className="text-2xl font-black tracking-tighter">
              UNBOX <span className="text-xs font-medium text-gray-400 ml-1">ADMIN</span>
            </Link>
          </div>

          {/* User Profile Summary */}
          <div className="p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/20">
                      <AvatarFallback className="bg-gray-800 text-white font-bold">
                          {user.nickname?.[0]?.toUpperCase()}
                      </AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="font-bold text-sm">{user.nickname}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {adminRole ? ADMIN_ROLE_MAP[adminRole] : '관리자'}
                      </p>
                  </div>
              </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
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
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white text-black shadow-md shadow-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-black" : "text-gray-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-950/30 gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 pt-16 md:pt-0">
        <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
        </div>
      </main>
    </div>
  );
}
