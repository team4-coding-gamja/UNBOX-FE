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
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  brandId: z.string().min(1, '브랜드를 선택해주세요'),
  name: z.string().min(1, '영문명을 입력해주세요'),
  nameKo: z.string().min(1, '한글명을 입력해주세요'),
  modelNumber: z.string().min(1, '모델번호를 입력해주세요'),
  releaseDate: z.string().min(1, '출시일을 입력해주세요'),
  releasePrice: z.number().min(0, '발매가를 입력해주세요'),
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, brandsRes] = await Promise.all([
        adminProductsApi.getAll(),
        adminBrandsApi.getAll(),
      ]);

      const productsData = productsRes.data?.data?.content || productsRes.data?.content || productsRes.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      const brandsData = brandsRes.data?.data || brandsRes.data || [];
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedProduct(null);
    reset({
      brandId: '',
      name: '',
      nameKo: '',
      modelNumber: '',
      releaseDate: '',
      releasePrice: 0,
      imageUrl: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    reset({
      brandId: product.brand?.id || '',
      name: product.name,
      nameKo: product.nameKo,
      modelNumber: product.modelNumber,
      releaseDate: product.releaseDate,
      releasePrice: product.releasePrice,
      imageUrl: product.imageUrl || '',
    });
    setDialogOpen(true);
  };

  const openOptionDialog = async (product: Product) => {
    setSelectedProduct(product);
    setProductOptions(product.options || []);
    setNewSize('');
    setOptionDialogOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        imageUrl: data.imageUrl || '',
      };

      if (selectedProduct) {
        await adminProductsApi.update(selectedProduct.id, payload);
        toast.success('상품이 수정되었습니다');
      } else {
        await adminProductsApi.create(payload);
        toast.success('상품이 등록되었습니다');
      }
      setDialogOpen(false);
      reset();
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || '상품 저장에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      await adminProductsApi.delete(selectedProduct.id);
      toast.success('상품이 삭제되었습니다');
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || '상품 삭제에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOption = async () => {
    if (!selectedProduct || !newSize.trim()) {
      toast.error('사이즈를 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminProductsApi.createOption(selectedProduct.id, { size: newSize.trim() });
      toast.success('사이즈가 추가되었습니다');
      setNewSize('');
      // Refresh options
      const response = await adminProductsApi.getAll();
      const productsData = response.data?.data?.content || response.data?.content || response.data || [];
      const updatedProduct = productsData.find((p: Product) => p.id === selectedProduct.id);
      if (updatedProduct) {
        setProductOptions(updatedProduct.options || []);
      }
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || '사이즈 추가에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!selectedProduct) return;

    try {
      await adminProductsApi.deleteOption(selectedProduct.id, optionId);
      setProductOptions((prev) => prev.filter((o) => o.id !== optionId));
      toast.success('사이즈가 삭제되었습니다');
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || '사이즈 삭제에 실패했습니다';
      toast.error(message);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
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
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          상품 추가
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">이미지</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead>브랜드</TableHead>
                <TableHead>모델번호</TableHead>
                <TableHead>발매가</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                      <img
                        src={product.imageUrl || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{product.nameKo}</p>
                    <p className="text-xs text-muted-foreground">{product.name}</p>
                  </TableCell>
                  <TableCell>{product.brand?.nameKo}</TableCell>
                  <TableCell>{product.modelNumber}</TableCell>
                  <TableCell>{formatPrice(product.releasePrice)}원</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openOptionDialog(product)}
                        title="사이즈 관리"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 bg-background rounded-lg border border-border">
          <p className="text-muted-foreground">등록된 상품이 없습니다</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? '상품 수정' : '상품 추가'}</DialogTitle>
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
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.nameKo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brandId && (
                <p className="text-xs text-destructive">{errors.brandId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameKo">한글명</Label>
                <Input id="nameKo" {...register('nameKo')} placeholder="한글 상품명" />
                {errors.nameKo && (
                  <p className="text-xs text-destructive">{errors.nameKo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">영문명</Label>
                <Input id="name" {...register('name')} placeholder="영문 상품명" />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelNumber">모델번호</Label>
              <Input id="modelNumber" {...register('modelNumber')} placeholder="DQ8801-100" />
              {errors.modelNumber && (
                <p className="text-xs text-destructive">{errors.modelNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">출시일</Label>
                <Input id="releaseDate" type="date" {...register('releaseDate')} />
                {errors.releaseDate && (
                  <p className="text-xs text-destructive">{errors.releaseDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="releasePrice">발매가</Label>
                <Input
                  id="releasePrice"
                  type="number"
                  {...register('releasePrice', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.releasePrice && (
                  <p className="text-xs text-destructive">{errors.releasePrice.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
              {errors.imageUrl && (
                <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Option Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사이즈 관리</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="text-sm text-muted-foreground mb-4">
              {selectedProduct.nameKo}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <Input
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="새 사이즈 (예: 270)"
            />
            <Button onClick={handleAddOption} disabled={isSubmitting}>
              추가
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {productOptions.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option.size}
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            {productOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">등록된 사이즈가 없습니다</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOptionDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.nameKo} 상품을 삭제하시겠습니까?
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
