import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_ROLE_MAP } from '@/types';
import { Users, Package, ClipboardCheck, Tags } from 'lucide-react';

export function AdminDashboard() {
  const { user, adminRole } = useAuth();

  const cards = [
    { label: '스태프 관리', icon: Users, roles: ['ROLE_MASTER'] },
    { label: '브랜드 관리', icon: Tags, roles: ['ROLE_MASTER', 'ROLE_MANAGER'] },
    { label: '상품 관리', icon: Package, roles: ['ROLE_MASTER', 'ROLE_MANAGER'] },
    { label: '주문 검수', icon: ClipboardCheck, roles: ['ROLE_MASTER', 'ROLE_INSPECTOR'] },
  ];

  const filteredCards = cards.filter((card) => 
    adminRole && card.roles.includes(adminRole)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">안녕하세요, {user?.nickname}님</h1>
      <p className="text-muted-foreground mb-8">
        {adminRole ? ADMIN_ROLE_MAP[adminRole] : '관리자'} 계정으로 로그인되었습니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <div
            key={card.label}
            className="p-6 bg-background rounded-lg border border-border"
          >
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4">
              <card.icon className="h-5 w-5" />
            </div>
            <p className="font-medium">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
