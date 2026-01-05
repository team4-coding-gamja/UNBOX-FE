import { useState, useEffect } from 'react';
import { adminUsersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Users, Info, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: number;
  email: string;
  nickname: string;
  phone: string;
  points: number;
  providerType: string;
  role: string;
  createdAt: string;
}

const updateSchema = z.object({
  nickname: z.string().regex(/^[a-z0-9]{4,10}$/, '닉네임은 4~10자의 영문 소문자와 숫자만 가능합니다'),
  phone: z.string().regex(/^\d{2,3}-?\d{3,4}-?\d{4}$/, '올바른 전화번호를 입력해주세요'),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
      register: registerEdit,
      handleSubmit: handleSubmitEdit,
      setValue: setValueEdit,
      formState: { errors: errorsEdit },
    } = useForm<UpdateFormData>({
      resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminUsersApi.getAll({ page: 0, size: 50 });
      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('사용자 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailDialog = (user: User) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setValueEdit('nickname', user.nickname);
    setValueEdit('phone', user.phone);
    setEditDialogOpen(true);
  };

  const onEditSubmit = async (data: UpdateFormData) => {
      if (!selectedUser) return;
      setIsSubmitting(true);
      try {
        await adminUsersApi.update(selectedUser.id, {
            nickname: data.nickname,
            phone: data.phone
        });
        toast.success('사용자 정보가 수정되었습니다');
        setEditDialogOpen(false);
        fetchUsers();
      } catch (error: any) {
        toast.error('정보 수정에 실패했습니다');
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleDelete = async () => {
      if (!selectedUser) return;
      setIsSubmitting(true);
      try {
        await adminUsersApi.delete(selectedUser.id);
        toast.success('사용자가 삭제되었습니다');
        setDeleteDialogOpen(false);
        fetchUsers();
      } catch (error) {
        toast.error('사용자 삭제에 실패했습니다');
      } finally {
        setIsSubmitting(false);
      }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch(e) {
        return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">사용자 관리</h1>
           <p className="text-gray-500 mt-1 text-sm">서비스에 가입된 일반 사용자를 조회합니다.</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={fetchUsers}>
          새로고침
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {users.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase text-gray-500">ID</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">User Info</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Phone</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Points</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Provider</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Joined</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 py-4 font-mono text-gray-500">#{user.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{user.nickname}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.phone}</TableCell>
                  <TableCell>
                      <Badge variant="secondary" className="font-mono bg-blue-50 text-blue-700 hover:bg-blue-100">
                          {user.points?.toLocaleString()} P
                      </Badge>
                  </TableCell>
                  <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                          {user.providerType}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-black rounded-full"
                        onClick={() => openDetailDialog(user)}
                      >
                         <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-blue-600 rounded-full"
                        onClick={() => openEditDialog(user)}
                      >
                         <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 rounded-full"
                        onClick={() => {
                            setSelectedUser(user);
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
             <h3 className="text-lg font-semibold text-gray-900">가입된 사용자가 없습니다</h3>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>사용자 상세 정보</DialogTitle>
            </DialogHeader>
            {selectedUser && (
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block mb-1">ID</span>
                            <span className="font-mono text-gray-900">#{selectedUser.id}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">이메일</span>
                            <span className="font-medium">{selectedUser.email}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">닉네임</span>
                            <span className="font-medium">{selectedUser.nickname}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">전화번호</span>
                            <span className="font-medium">{selectedUser.phone}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">보유 포인트</span>
                            <span className="font-medium">{selectedUser.points?.toLocaleString()} P</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">가입 유형</span>
                            <span className="font-medium">{selectedUser.providerType}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">가입일</span>
                            <span className="font-medium">{formatDate(selectedUser.createdAt)}</span>
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>사용자 정보 수정</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input id="nickname" {...registerEdit('nickname')} />
                    {errorsEdit.nickname && <p className="text-xs text-red-500">{errorsEdit.nickname.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input id="phone" {...registerEdit('phone')} />
                    {errorsEdit.phone && <p className="text-xs text-red-500">{errorsEdit.phone.message}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>취소</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? '수정 중...' : '수정'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                    정말로 <span className="font-bold text-black">{selectedUser?.nickname}</span> 님을 삭제하시겠습니까?
                    <br />삭제된 계정은 복구할 수 없습니다.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    {isSubmitting ? '삭제 중...' : '삭제'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
