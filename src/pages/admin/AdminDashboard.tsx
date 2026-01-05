import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_ROLE_MAP } from '@/types';
import { Users, Package, ClipboardCheck, Tags, ChevronRight, BarChart3, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { user, adminRole } = useAuth();

  const cards = [
    { 
      label: '스태프 관리', 
      desc: '관리자 계정을 관리합니다.',
      icon: Users, 
      roles: ['ROLE_MASTER'],
      path: '/admin/staff',
      color: 'bg-blue-500/10 text-blue-600'
    },
    { 
      label: '회원 관리', 
      desc: '일반 사용자 계정을 관리합니다.',
      icon: UserCircle, 
      roles: ['ROLE_MASTER', 'ROLE_MANAGER'],
      path: '/admin/users',
      color: 'bg-orange-500/10 text-orange-600'
    },
    { 
      label: '브랜드 관리', 
      desc: '입점 브랜드를 관리합니다.',
      icon: Tags, 
      roles: ['ROLE_MASTER', 'ROLE_MANAGER'],
      path: '/admin/brands',
      color: 'bg-indigo-500/10 text-indigo-600'
    },
    { 
      label: '상품 관리', 
      desc: '전체 상품 목록을 관리합니다.',
      icon: Package, 
      roles: ['ROLE_MASTER', 'ROLE_MANAGER'],
      path: '/admin/products',
      color: 'bg-violet-500/10 text-violet-600'
    },
    { 
      label: '주문 검수', 
      desc: '미발송 및 검수 대기 주문을 처리합니다.',
      icon: ClipboardCheck, 
      roles: ['ROLE_MASTER', 'ROLE_INSPECTOR'],
      path: '/admin/orders',
      color: 'bg-emerald-500/10 text-emerald-600'
    },
  ];

  const filteredCards = cards.filter((card) => 
    adminRole && card.roles.includes(adminRole)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">
              Welcome back, {user?.nickname}!
            </h1>
            <p className="text-gray-500">
              <span className="font-semibold text-black">{adminRole ? ADMIN_ROLE_MAP[adminRole] : '관리자'}</span> 권한으로 접속하셨습니다.
              오늘의 업무를 확인하세요.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
               <span className="text-xs text-gray-400">TODAY</span>
               <span className="text-lg font-bold font-mono">{new Date().toLocaleDateString()}</span>
             </div>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> 바로가기
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCards.map((card) => (
            <Link 
              key={card.label} 
              to={card.path}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color} transition-colors`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-black">{card.label}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
