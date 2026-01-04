import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await adminLogin(data.email, data.password);
      toast.success('관리자 페이지에 접속했습니다.');
      navigate('/admin');
    } catch (error: any) {
      const message = error.response?.data?.message || '로그인에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950 animate-in fade-in duration-500">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-6 text-white">
             <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
            UNBOX
            <span className="text-sm font-medium text-zinc-500 ml-2 align-middle tracking-normal">ADMIN</span>
          </h1>
          <p className="text-zinc-500 text-sm">플랫폼 관리를 위한 관리자 전용 페이지입니다.</p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@unbox.com"
                {...register('email')}
                disabled={isLoading}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-black hover:bg-zinc-800 text-white font-bold h-11" disabled={isLoading}>
              {isLoading ? '접속 중...' : '관리자 로그인'}
            </Button>
          </form>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center text-zinc-600">
            <span className="text-sm">관리자 계정이 아니신가요? </span>
            <Link to="/" className="text-sm text-zinc-400 hover:text-white underline underline-offset-4 transition-colors ml-1">
              서비스 홈으로 돌아가기
            </Link>
        </div>
      </div>
    </div>
  );
}
