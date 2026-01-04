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

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
      await login(data.email, data.password);
      toast.success('로그인되었습니다');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || '로그인에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white animate-in fade-in duration-500">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link to="/" className="text-4xl font-black tracking-tighter italic block mb-2">
            UNBOX
          </Link>
          <p className="text-gray-400 text-sm">리미티드 에디션 거래의 시작</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-gray-900">이메일 주소</Label>
            <Input
              id="email"
              type="email"
              placeholder="예) unbox@unbox.com"
              {...register('email')}
              disabled={isLoading}
              className="h-12 px-4 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all rounded-lg placeholder:text-gray-300"
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold text-gray-900">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              {...register('password')}
              disabled={isLoading}
              className="h-12 px-4 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all rounded-lg placeholder:text-gray-300"
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-4">
            <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-lg transition-colors" 
                disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>

        {/* Links */}
        <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-400">
            <Link to="/auth/signup" className="hover:text-black transition-colors">이메일 가입</Link>
            <span className="w-px h-3 bg-gray-300"></span>
            <Link to="#" className="hover:text-black transition-colors">이메일 찾기</Link>
            <span className="w-px h-3 bg-gray-300"></span>
            <Link to="#" className="hover:text-black transition-colors">비밀번호 찾기</Link>
        </div>
      </div>
    </div>
  );
}
