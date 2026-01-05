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

const signupSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(15, '비밀번호는 15자 이하여야 합니다')
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,15}$/,
      '비밀번호는 영문, 숫자, 특수문자 조합 8~15자여야 합니다'
    ),
  confirmPassword: z.string(),
  phone: z
    .string()
    .min(10, '전화번호 형식이 올바르지 않습니다')
    .max(13, '전화번호 형식이 올바르지 않습니다'),
  nickname: z
    .string()
    .min(4, '닉네임은 4자 이상이어야 합니다')
    .max(10, '닉네임은 10자 이하여야 합니다')
    .regex(/^[a-z0-9]+$/, '닉네임은 영문 소문자와 숫자만 사용 가능합니다'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password, data.nickname, data.phone);
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/auth/login');
    } catch (error: any) {
      let message = '회원가입에 실패했습니다';
      const responseData = error.response?.data;

      if (responseData) {
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData.message) {
          message = responseData.message;
        } else if (typeof responseData === 'object') {
          const errorMessages = Object.values(responseData).filter(
            (val): val is string => typeof val === 'string'
          );
          if (errorMessages.length > 0) {
            message = errorMessages.join(', ');
          }
        }
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white animate-in fade-in duration-500">
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
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              {...register('password')}
              disabled={isLoading}
              className="h-12 px-4 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all rounded-lg placeholder:text-gray-300"
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-900">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 한번 더 입력해주세요"
              {...register('confirmPassword')}
              disabled={isLoading}
              className="h-12 px-4 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all rounded-lg placeholder:text-gray-300"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-bold text-gray-900">전화번호</Label>
            <Input
              id="phone"
              type="text"
              placeholder="예) 01012345678"
              {...register('phone')}
              disabled={isLoading}
              className="h-12 px-4 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all rounded-lg placeholder:text-gray-300"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-sm font-bold text-gray-900">닉네임</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="사용하실 닉네임을 입력해주세요"
              {...register('nickname')}
              disabled={isLoading}
              className="h-12 px-4 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all rounded-lg placeholder:text-gray-300"
            />
            {errors.nickname && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.nickname.message}</p>
            )}
          </div>

          <div className="pt-4">
            <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold text-base rounded-lg transition-colors" 
                disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </div>
        </form>

        {/* Links */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-400">이미 회원이신가요?</span>{' '}
          <Link to="/auth/login" className="font-medium text-black hover:underline ml-1">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
