import { useState, useEffect } from 'react';
import { adminStaffApi } from '@/lib/api';
import { AdminUser } from '@/types';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Trash2, Users, Pencil, UserCog } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

const staffSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z
    .string()
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,15}$/,
      '비밀번호는 8~15자이며, 영문, 숫자, 특수문자를 포함해야 합니다'
    ),
  nickname: z.string().regex(/^[a-z0-9]{4,10}$/, '닉네임은 4~10자의 영문 소문자와 숫자만 가능합니다'),
  phone: z.string().regex(/^\d{2,3}-?\d{3,4}-?\d{4}$/, '올바른 전화번호를 입력해주세요'),
  adminRole: z.enum(['ROLE_MANAGER', 'ROLE_INSPECTOR']),
});

const updateSchema = z.object({
  nickname: z.string().regex(/^[a-z0-9]{4,10}$/, '닉네임은 4~10자의 영문 소문자와 숫자만 가능합니다'),
  phone: z.string().regex(/^\d{2,3}-?\d{3,4}-?\d{4}$/, '올바른 전화번호를 입력해주세요'),
});

type StaffFormData = z.infer<typeof staffSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

export function StaffManagementPage() {
  const { user, refreshUser } = useAuth();
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [myInfoDialogOpen, setMyInfoDialogOpen] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  // Create Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    watch: watchCreate,
    formState: { errors: errorsCreate },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      adminRole: 'ROLE_MANAGER',
    },
  });

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
  });

  // My Info Form
  const {
    register: registerMyInfo,
    handleSubmit: handleSubmitMyInfo,
    setValue: setValueMyInfo,
    formState: { errors: errorsMyInfo },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    fetchStaff();
  }, [activeTab]);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      let response;
      const params = { page: 0, size: 100 };
      
      if (activeTab === 'MANAGERS') {
        response = await adminStaffApi.getManagers(params);
      } else if (activeTab === 'INSPECTORS') {
        response = await adminStaffApi.getInspectors(params);
      } else {
        response = await adminStaffApi.getAll(params);
      }

      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('스태프 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      await adminStaffApi.create(data as any);
      toast.success('스태프가 등록되었습니다');
      setCreateDialogOpen(false);
      resetCreate();
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || '스태프 등록에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (data: UpdateFormData) => {
    if (!selectedStaff) return;
    setIsSubmitting(true);
    try {
      await adminStaffApi.update(selectedStaff.id, data as any);
      toast.success('정보가 수정되었습니다');
      setEditDialogOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || '수정에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMyInfoSubmit = async (data: UpdateFormData) => {
    setIsSubmitting(true);
    try {
      await adminStaffApi.updateMe(data as any);
      toast.success('내 정보가 수정되었습니다');
      setMyInfoDialogOpen(false);
      await refreshUser(); // Update context
    } catch (error: any) {
      const message = error.response?.data?.message || '내 정보 수정에 실패했습니다';
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

  const openEditDialog = (member: AdminUser) => {
    setSelectedStaff(member);
    setValueEdit('nickname', member.nickname);
    setValueEdit('phone', member.phone);
    setEditDialogOpen(true);
  };

  const openMyInfoDialog = () => {
    if (user) {
      setValueMyInfo('nickname', user.nickname);
      setValueMyInfo('phone', user.phone || '');
      setMyInfoDialogOpen(true);
    }
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
        <div className="flex gap-3">
          <Button onClick={openMyInfoDialog} variant="outline" className="rounded-full px-4">
            <UserCog className="h-4 w-4 mr-2" />
            내 정보 수정
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
            <Plus className="h-4 w-4 mr-2" />
            스태프 추가
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="ALL">전체</TabsTrigger>
            <TabsTrigger value="MANAGERS">매니저</TabsTrigger>
            <TabsTrigger value="INSPECTORS">검수자</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {staff.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="py-4 pl-6 text-xs font-semibold uppercase text-gray-500 w-[200px]">Profile</TableHead>
                  <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Email</TableHead>
                  <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Role</TableHead>
                  <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Phone</TableHead>
                  <TableHead className="w-32 text-right pr-6">Management</TableHead>
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
                    <TableCell className="text-gray-600">{member.phone}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                          onClick={() => openEditDialog(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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
                      </div>
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
               <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                  첫 스태프 추가하기
               </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>스태프 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                {...registerCreate('email')}
                placeholder="이메일 주소"
              />
              {errorsCreate.email && (
                <p className="text-xs text-destructive">{errorsCreate.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                {...registerCreate('password')}
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              />
              {errorsCreate.password && (
                <p className="text-xs text-destructive">{errorsCreate.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">이름</Label>
              <Input
                id="nickname"
                {...registerCreate('nickname')}
                placeholder="이름"
              />
              {errorsCreate.nickname && (
                <p className="text-xs text-destructive">{errorsCreate.nickname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                {...registerCreate('phone')}
                placeholder="010-0000-0000"
              />
              {errorsCreate.phone && (
                <p className="text-xs text-destructive">{errorsCreate.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>역할</Label>
              <Select
                value={watchCreate('adminRole')}
                onValueChange={(value) => setValueCreate('adminRole', value as 'ROLE_MANAGER' | 'ROLE_INSPECTOR')}
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
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-gray-800">
                {isSubmitting ? '등록 중...' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>정보 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="edit-nickname">소문자 영어 닉네임</Label>
              <Input
                id="edit-nickname"
                {...registerEdit('nickname')}
              />
              {errorsEdit.nickname && (
                <p className="text-xs text-destructive">{errorsEdit.nickname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">전화번호</Label>
              <Input
                id="edit-phone"
                {...registerEdit('phone')}
              />
              {errorsEdit.phone && (
                <p className="text-xs text-destructive">{errorsEdit.phone.message}</p>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>취소</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-black text-white">
                {isSubmitting ? '수정 중...' : '수정'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* My Info Dialog */}
      <Dialog open={myInfoDialogOpen} onOpenChange={setMyInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>내 정보 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitMyInfo(onMyInfoSubmit)} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="my-nickname">소문자 영어 닉네임</Label>
              <Input
                id="my-nickname"
                {...registerMyInfo('nickname')}
              />
              {errorsMyInfo.nickname && (
                <p className="text-xs text-destructive">{errorsMyInfo.nickname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="my-phone">전화번호</Label>
              <Input
                id="my-phone"
                {...registerMyInfo('phone')}
              />
              {errorsMyInfo.phone && (
                <p className="text-xs text-destructive">{errorsMyInfo.phone.message}</p>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setMyInfoDialogOpen(false)}>취소</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-black text-white">
                {isSubmitting ? '수정 중...' : '수정'}
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
