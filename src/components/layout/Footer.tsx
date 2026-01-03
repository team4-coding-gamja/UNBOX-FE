import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold tracking-tighter mb-4">UNBOX</h3>
            <p className="text-sm text-muted-foreground">
              한정판 스니커즈 리셀 플랫폼
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">이용안내</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  검수 기준
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  이용 정책
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  패널티 정책
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  공지사항
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">회사</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  회사소개
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  채용
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-foreground transition-colors">
                  관리자
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 UNBOX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
