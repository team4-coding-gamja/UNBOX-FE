import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Heart, ChevronRight } from 'lucide-react';

export function MyPageHome() {
  const { user } = useAuth();

  const quickLinks = [
    { path: '/mypage/orders', label: '구매 내역', icon: Package, description: '주문 및 배송 상태 확인' },
    { path: '/mypage/sales', label: '판매 내역', icon: ShoppingBag, description: '판매 입찰 및 거래 내역' },
    { path: '/mypage/wishlist', label: '위시리스트', icon: Heart, description: '관심 상품 목록' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">마이페이지</h1>

      {/* User Info */}
      <div className="p-6 bg-muted rounded-2xl mb-8">
        <p className="text-lg font-bold mb-1">{user?.nickname}님</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        {quickLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
