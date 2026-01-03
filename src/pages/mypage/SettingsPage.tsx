import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(20, '닉네임은 20자 이하여야 합니다'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await userApi.updateMe(data);
      await refreshUser();
      toast.success('프로필이 수정되었습니다');
    } catch (error: any) {
      const message = error.response?.data?.message || '프로필 수정에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userApi.deleteMe();
      await logout();
      toast.success('회원 탈퇴가 완료되었습니다');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || '회원 탈퇴에 실패했습니다';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">설정</h1>

      {/* Profile Edit */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">프로필 수정</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" value={user?.email || ''} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              {...register('nickname')}
              disabled={isLoading}
            />
            {errors.nickname && (
              <p className="text-xs text-destructive">{errors.nickname.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </form>
      </section>

      <Separator className="my-8" />

      {/* Delete Account */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-destructive">회원 탈퇴</h2>
        <p className="text-sm text-muted-foreground mb-4">
          회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">회원 탈퇴</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? '처리 중...' : '탈퇴'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
