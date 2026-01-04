import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="text-center flex flex-col items-center max-w-md">
        <h1 className="mb-2 text-8xl font-black italic tracking-tighter text-gray-200">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-black">페이지를 찾을 수 없습니다</h2>
        <p className="mb-8 text-gray-500 font-medium">
          요청하신 페이지가 삭제되었거나,<br/>
          잘못된 경로로 접근하셨습니다.
        </p>
        
        <Button 
          onClick={() => navigate('/')} 
          size="lg"
          className="rounded-full bg-black text-white hover:bg-gray-800 font-bold px-8 h-12"
        >
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
