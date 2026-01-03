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
import { Plus, Trash2 } from 'lucide-react';
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
      await adminStaffApi.create(data);
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
      <div>
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">스태프 관리</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          스태프 추가
        </Button>
      </div>

      {staff.length > 0 ? (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.nickname}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ADMIN_ROLE_MAP[member.adminRole]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(member.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedStaff(member);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 bg-background rounded-lg border border-border">
          <p className="text-muted-foreground">등록된 스태프가 없습니다</p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
              {selectedStaff?.nickname}님을 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
