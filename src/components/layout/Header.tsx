import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tighter">
            UNBOX
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-muted-foreground transition-colors">
              홈
            </Link>
            <Link to="/sell" className="text-sm font-medium hover:text-muted-foreground transition-colors">
              판매하기
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/mypage/wishlist">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.nickname}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/mypage')}>
                      마이페이지
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/mypage/orders')}>
                      구매 내역
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/mypage/sales')}>
                      판매 내역
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  로그인
                </Button>
                <Button size="sm" onClick={() => navigate('/auth/signup')}>
                  회원가입
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                to="/sell"
                className="text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                판매하기
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/mypage/wishlist"
                    className="text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    위시리스트
                  </Link>
                  <Link
                    to="/mypage"
                    className="text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-left text-destructive"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate('/auth/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigate('/auth/signup');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    회원가입
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
