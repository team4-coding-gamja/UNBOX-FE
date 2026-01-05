import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Heart, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersApi, sellingBidsApi, wishlistApi } from '@/lib/api';

export function MyPageHome() {
  const { user } = useAuth();

  // Stats State
  const [stats, setStats] = useState([
    { label: '구매 내역', value: 0, unit: '건', path: '/mypage/orders' },
    { label: '판매 내역', value: 0, unit: '건', path: '/mypage/sales' },
    { label: '관심 상품', value: 0, unit: '개', path: '/mypage/wishlist' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, salesRes, wishlistRes] = await Promise.all([
          ordersApi.getMine({ size: 1 }),
          sellingBidsApi.getMine({ size: 100 }), // Slice response doesn't have totalElements, so we fetch more to get a count (capped at 100)
          wishlistApi.getAll()
        ]);
        
        setStats([
            { label: '구매 내역', value: ordersRes.data?.data?.totalElements || 0, unit: '건', path: '/mypage/orders' },
            { label: '판매 내역', value: salesRes.data?.numberOfElements ?? salesRes.data?.content?.length ?? 0, unit: '건', path: '/mypage/sales' },
            { label: '관심 상품', value: Array.isArray(wishlistRes.data) ? wishlistRes.data.length : (wishlistRes.data?.data?.length || 0), unit: '개', path: '/mypage/wishlist' },
        ]);
      } catch (e) {
        console.error('Failed to fetch dashboard stats', e);
      }
    };
    if (user) fetchStats();
  }, [user]);

  return (
    <div className="space-y-10">
      {/* Profile Section */}
      <section className="bg-muted/30 border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground border-4 border-background shadow-sm">
             {user?.nickname?.[0]?.toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-1">{user?.nickname}</h2>
            <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              일반 회원
            </div>
          </div>
        </div>
        <div className="flex gap-3">
            <Link to="/mypage/settings">
                <Button variant="outline" className="rounded-full">
                    <Settings className="w-4 h-4 mr-2" /> 프로필 관리
                </Button>
            </Link>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            to={stat.path}
            className="group block bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <p className="text-sm text-muted-foreground mb-2 group-hover:text-primary transition-colors">{stat.label}</p>
            <div className="flex items-end gap-1">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm mb-1.5">{stat.unit}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent Activity or Banner (Mock) */}
      <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
              <div>
                  <h3 className="font-bold text-lg mb-1">보유 포인트 0P</h3>
                  <p className="text-sm text-muted-foreground">적립된 포인트가 없습니다.</p>
              </div>
              <Button variant="ghost" size="sm" className="hidden">
                  내역 보기 <ChevronRight className="w-4 h-4 ml-1"/>
              </Button>
          </div>
      </section>
    </div>
  );
}
