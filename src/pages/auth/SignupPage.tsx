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
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'
    ),
  confirmPassword: z.string(),
  phone: z
    .string()
    .min(10, '전화번호 형식이 올바르지 않습니다')
    .max(13, '전화번호 형식이 올바르지 않습니다'),
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(20, '닉네임은 20자 이하여야 합니다'),
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold tracking-tighter">
            UNBOX
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일 주소</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="text"
              placeholder="01012345678"
              {...register('phone')}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="닉네임"
              {...register('nickname')}
              disabled={isLoading}
            />
            {errors.nickname && (
              <p className="text-xs text-destructive">{errors.nickname.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">이미 회원이신가요?</span>{' '}
          <Link to="/auth/login" className="font-medium hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
