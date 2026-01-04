import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-xl font-black italic tracking-tighter mb-6 text-black">UNBOX</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              한정판 스니커즈를 거래하는<br />가장 안전하고 빠른 방법
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">이용안내</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  검수 기준
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  이용 정책
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  패널티 정책
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">고객지원</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  공지사항
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">회사</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  회사소개
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-black transition-colors">
                  채용
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-black transition-colors">
                  관리자 로그인
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">
            © 2026 UNBOX. All rights reserved.
          </p>
          <div className="flex gap-6">
             <Link to="#" className="text-xs text-gray-400 hover:text-black">개인정보처리방침</Link>
             <Link to="#" className="text-xs text-gray-400 hover:text-black">이용약관</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
