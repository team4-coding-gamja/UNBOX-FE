import { useState, useEffect } from 'react';
import { adminProductsApi, adminBrandsApi } from '@/lib/api';
import { Product, Brand, ProductOption } from '@/types';
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
import { Plus, Pencil, Trash2, Settings, Package, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  brandId: z.string().min(1, '브랜드를 선택해주세요'),
  name: z.string().min(1, '상품명을 입력해주세요'),
  modelNumber: z.string().min(1, '모델번호를 입력해주세요'),
  imageUrl: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [newSize, setNewSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    // API Spec does not define GET /api/admin/products or GET /api/admin/brands.
    // We attempt to fetch brands anyway in case it works, or fail gracefully.
    fetchBrands(); 
    setIsLoading(false);
  }, []);

  const fetchBrands = async () => {
    try {
      // Trying to fetch brands. If spec doesn't implement it, this might fail or return empty.
      const brandsRes = await adminBrandsApi.getAll();
      const brandsData = brandsRes.data?.data || brandsRes.data || [];
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (error) {
      // console.error(error); // Expected if endpoint missing
      setBrands([]);
    }
  };

  const openCreateDialog = () => {
    setSelectedProduct(null);
    reset({
      brandId: '',
      name: '',
      modelNumber: '',
      imageUrl: '',
    });
    setDialogOpen(true);
  };

  // Edit is disabled because we can't list products to select them
  const openEditDialog = (product: Product) => {
     // implementation kept for reference but UI won't reach here
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        imageUrl: data.imageUrl || '',
        category: 'SHOES', // Spec requires category
      };

      if (selectedProduct) {
        // Update not supported fully as we can't list
      } else {
        await adminProductsApi.create(payload as any);
        toast.success('상품이 등록되었습니다');
      }
      setDialogOpen(false);
      reset();
      // No fetch data
    } catch (error: any) {
      const message = error.response?.data?.message || '상품 저장에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // Delete not reachable
  };

  const handleAddOption = async () => {
     // Option mgmt not reachable
  };

  const handleDeleteOption = async (optionId: string) => {
    // Option mgmt not reachable
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
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">상품 관리</h1>
           <p className="text-gray-500 mt-1 text-sm">판매 상품을 등록합니다.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
          <Plus className="h-4 w-4 mr-2" />
          상품 추가
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Package className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">상품 목록을 표시할 수 없습니다</h3>
             <p className="text-gray-500 mt-1 mb-6 max-w-xl">
               API 명세서에 상품 목록 조회(GET) 엔드포인트가 정의되지 않았습니다.<br/>
               하지만 상품 등록(POST)은 가능합니다. (브랜드 목록이 있어야 가능합니다)
             </p>
             <Button onClick={openCreateDialog} variant="outline">
                상품 추가하기
             </Button>
          </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>상품 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>브랜드</Label>
              <Select
                value={watch('brandId')}
                onValueChange={(value) => setValue('brandId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="브랜드 선택" />
                </SelectTrigger>
                <SelectContent>
                  {brands.length > 0 ? brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  )) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      브랜드 목록을 불러올 수 없습니다
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.brandId && (
                <p className="text-xs text-destructive">{errors.brandId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">상품명</Label>
              <Input id="name" {...register('name')} placeholder="상품명" />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelNumber">모델번호</Label>
              <Input id="modelNumber" {...register('modelNumber')} placeholder="DQ8801-100" />
              {errors.modelNumber && (
                <p className="text-xs text-destructive">{errors.modelNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
              {errors.imageUrl && (
                <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
              )}
            </div>

            <input type="hidden" value="SHOES" />

            <DialogFooter className="mt-4">
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
    </div>
  );
}
