import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Heart, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-black italic tracking-tighter">
            UNBOX
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
             <nav className="flex items-center gap-6 mr-4">
                <Link to="/" className="text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors">HOME</Link>
                <Link to="/sell" className="text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors">STYLE</Link>
                <Link to="#" className="text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors">SHOP</Link>
             </nav>

             <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100 transition-colors">
                  <Search className="h-6 w-6" />
                </Button>

              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                     <div className="flex items-center gap-3">
                        <Link to="/admin">
                            <Button variant="ghost" className="font-bold">
                                관리자 대시보드
                            </Button>
                        </Link>
                         <Button variant="ghost" className="text-red-600 font-bold" onClick={handleLogout}>
                            로그아웃
                        </Button>
                     </div>
                  ) : (
                      <>
                        <Link to="/mypage/wishlist">
                          <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100 transition-colors">
                            <Heart className="h-6 w-6" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100 transition-colors">
                              <User className="h-6 w-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2">
                            <div className="px-2 py-2 mb-1 bg-gray-50 rounded-md">
                              <p className="text-sm font-bold truncate">{user?.nickname}</p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <DropdownMenuItem onClick={() => navigate('/mypage')} className="cursor-pointer">
                              마이페이지
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/mypage/orders')} className="cursor-pointer">
                              구매 내역
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/mypage/sales')} className="cursor-pointer">
                              판매 내역
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700">
                              로그아웃
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                  )}
                </>
              ) : (
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                    <Link to="/auth/login" className="hover:text-black transition-colors">로그인</Link>
                    <Link to="/auth/signup" className="hover:text-black transition-colors">회원가입</Link>
                  </div>
                )}
             </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-4 p-4">
              <Link
                to="/"
                className="text-lg font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                to="/sell"
                className="text-lg font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                STYLE
              </Link>
              
              <div className="h-px bg-gray-100 my-2"></div>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                          <p className="font-bold">{user?.nickname}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                  </div>
                  <Link
                    to="/mypage"
                    className="text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <Link
                    to="/mypage/wishlist"
                    className="text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    관심상품
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-left text-red-600 py-2"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={() => {
                      navigate('/auth/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    className="h-10 bg-black text-white hover:bg-gray-800"
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
