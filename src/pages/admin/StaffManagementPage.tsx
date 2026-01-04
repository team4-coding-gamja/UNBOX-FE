import { useState, useEffect } from 'react';
import { adminStaffApi } from '@/lib/api';
import { AdminUser, ADMIN_ROLE_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const staffSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'
    ),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
  phone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호를 입력해주세요'),
  adminRole: z.enum(['ROLE_MANAGER', 'ROLE_INSPECTOR']),
});

type StaffFormData = z.infer<typeof staffSchema>;

export function StaffManagementPage() {
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      adminRole: 'ROLE_MANAGER',
    },
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await adminStaffApi.getAll();
      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('스태프 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      await adminStaffApi.create(data as any);
      toast.success('스태프가 등록되었습니다');
      setDialogOpen(false);
      reset();
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || '스태프 등록에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;

    setIsSubmitting(true);
    try {
      await adminStaffApi.delete(selectedStaff.id);
      toast.success('스태프가 삭제되었습니다');
      setDeleteDialogOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || '스태프 삭제에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
             <Skeleton className="h-8 w-40 mb-2" />
             <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">스태프 관리</h1>
           <p className="text-gray-500 mt-1 text-sm">플랫폼 관리자 계정을 생성하고 권한을 부여합니다.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
          <Plus className="h-4 w-4 mr-2" />
          스태프 추가
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {staff.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase text-gray-500 w-[200px]">Profile</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Email</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Role</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Joined</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {member.nickname[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{member.nickname}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{member.email}</TableCell>
                  <TableCell>
                    {member.adminRole === 'ROLE_MASTER' ? (
                        <Badge className="bg-black text-white hover:bg-gray-900">Master</Badge>
                    ) : member.adminRole === 'ROLE_MANAGER' ? (
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">Manager</Badge>
                    ) : (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Inspector</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{formatDate(member.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => {
                        setSelectedStaff(member);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Users className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">등록된 스태프가 없습니다</h3>
             <p className="text-gray-500 mt-1 mb-6 max-w-sm">새로운 스태프를 추가하여 관리 권한을 부여하세요.</p>
             <Button onClick={() => setDialogOpen(true)} variant="outline">
                첫 스태프 추가하기
             </Button>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>스태프 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="이메일 주소"
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
                {...register('password')}
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">이름</Label>
              <Input
                id="nickname"
                {...register('nickname')}
                placeholder="이름"
              />
              {errors.nickname && (
                <p className="text-xs text-destructive">{errors.nickname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="010-0000-0000"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>역할</Label>
              <Select
                value={watch('adminRole')}
                onValueChange={(value) => setValue('adminRole', value as 'ROLE_MANAGER' | 'ROLE_INSPECTOR')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_MANAGER">매니저</SelectItem>
                  <SelectItem value="ROLE_INSPECTOR">검수자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-gray-800">
                {isSubmitting ? '등록 중...' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스태프 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-black">{selectedStaff?.nickname}</span>님을 삭제하시겠습니까?
              <br/>삭제된 계정은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
