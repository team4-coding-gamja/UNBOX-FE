import { useState, useEffect } from 'react';
import { adminBrandsApi } from '@/lib/api';
import { Brand } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().min(1, '영문명을 입력해주세요'),
  nameKo: z.string().min(1, '한글명을 입력해주세요'),
});

type BrandFormData = z.infer<typeof brandSchema>;

export function BrandManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await adminBrandsApi.getAll();
      const data = response.data?.data || response.data || [];
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('브랜드 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedBrand(null);
    reset({ name: '', nameKo: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    reset({ name: brand.name, nameKo: brand.nameKo });
    setDialogOpen(true);
  };

  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedBrand) {
        await adminBrandsApi.update(selectedBrand.id, data as any);
        toast.success('브랜드가 수정되었습니다');
      } else {
        await adminBrandsApi.create(data as any);
        toast.success('브랜드가 등록되었습니다');
      }
      setDialogOpen(false);
      reset();
      fetchBrands();
    } catch (error: any) {
      const message = error.response?.data?.message || '브랜드 저장에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;

    setIsSubmitting(true);
    try {
      await adminBrandsApi.delete(selectedBrand.id);
      toast.success('브랜드가 삭제되었습니다');
      setDeleteDialogOpen(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error: any) {
      const message = error.response?.data?.message || '브랜드 삭제에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">브랜드 관리</h1>
           <p className="text-gray-500 mt-1 text-sm">등록된 브랜드를 수정하거나 새로운 브랜드를 추가합니다.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
          <Plus className="h-4 w-4 mr-2" />
          브랜드 추가
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {brands.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase text-gray-500">Brand Name (KO)</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Brand Name (EN)</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 py-4 font-semibold text-gray-900">{brand.nameKo}</TableCell>
                  <TableCell className="text-gray-600 font-medium">{brand.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full"
                        onClick={() => openEditDialog(brand)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => {
                          setSelectedBrand(brand);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                 <Tags className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">등록된 브랜드가 없습니다</h3>
             <p className="text-gray-500 mt-1 mb-6 max-w-sm">새로운 브랜드를 추가하여 상품을 등록할 수 있습니다.</p>
             <Button onClick={openCreateDialog} variant="outline">
                첫 브랜드 추가하기
             </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedBrand ? '브랜드 수정' : '브랜드 추가'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameKo">한글명</Label>
              <Input
                id="nameKo"
                {...register('nameKo')}
                placeholder="예: 나이키"
              />
              {errors.nameKo && (
                <p className="text-xs text-destructive">{errors.nameKo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">영문명</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="예: Nike"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-gray-800">
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>브랜드 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-black">{selectedBrand?.nameKo}</span> 브랜드를 삭제하시겠습니까?
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
