import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminProductsApi, adminBrandsApi, productsApi } from '@/lib/api';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [missingBrandAlertOpen, setMissingBrandAlertOpen] = useState(false);
  const [targetBrandName, setTargetBrandName] = useState('');
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
    setIsLoading(true);
    try {
      // Use public API for listing products as User requested workaround
      const productsRes = await productsApi.getAll({ size: 100 }); 
      const productsData = productsRes.data?.data?.content || productsRes.data?.content || productsRes.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Try to fetch brands relative to Admin API availability
      try {
        const brandsRes = await adminBrandsApi.getAll();
        const brandsData = brandsRes.data?.data || brandsRes.data || [];
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (e) {
        // console.log("brands fetch failed");
      }
    } catch (error) {
      // console.error(error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.createProduct && brands.length > 0 && !dialogOpen) {
        const { initialName, initialBrandName } = location.state;
        
        // Find brand ID by name (insensitive search)
        const matchedBrand = brands.find(b => 
            b.name.toLowerCase() === initialBrandName?.toLowerCase()
        );

        if (matchedBrand) {
            setSelectedProduct(null);
            reset({
                brandId: matchedBrand.id || '',
                name: initialName || '',
                modelNumber: '',
                imageUrl: '',
            });
            setDialogOpen(true);
        } else if (initialBrandName) {
            // Brand not found
            setTargetBrandName(initialBrandName);
            setMissingBrandAlertOpen(true);
        }
        
        // Optional: clear state to prevent reopening on generic refresh, 
        // but explicit navigation usually clears or we just ignore duplicate actions
        window.history.replaceState({}, document.title);
    }
  }, [brands, location.state]);

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

  const openOptionDialog = (product: Product) => {
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
      toast.error('상품 삭제에 실패했습니다');
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
      await adminProductsApi.createOption(selectedProduct.id, { option: newSize.trim() });
      toast.success('사이즈가 추가되었습니다');
      setNewSize('');
      
      // Reload products to update options
      const productsRes = await productsApi.getAll({ size: 100 });
      const productsData = productsRes.data?.data?.content || productsRes.data?.content || productsRes.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Update local options state
      const updatedProduct = productsData.find((p: Product) => p.id === selectedProduct.id);
      if (updatedProduct) {
        setProductOptions(updatedProduct.options || []);
      }
    } catch (error: any) {
      toast.error('사이즈 추가에 실패했습니다. (중복 등)');
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
      toast.error('사이즈 삭제에 실패했습니다');
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
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">상품 관리</h1>
           <p className="text-gray-500 mt-1 text-sm">판매 상품을 등록합니다.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
          <Plus className="h-4 w-4 mr-2" />
          상품 추가
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {products.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase text-gray-500 w-[100px]">Image</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Product Info</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Brand</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Model No.</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Lowest Price</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={product.imageUrl || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                        {product.nameKo && <span className="text-xs text-gray-500 mt-0.5">{product.nameKo}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {product.brandName}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">{product.modelNumber}</TableCell>
                  <TableCell className="font-medium">
                    {product.lowestPrice ? `${new Intl.NumberFormat('ko-KR').format(product.lowestPrice)}원` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        onClick={() => openOptionDialog(product)}
                        title="사이즈 및 가격 확인"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => {
                          setSelectedProduct(product);
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
                 <Package className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">등록된 상품이 없습니다</h3>
             <p className="text-gray-500 mt-1 mb-6 max-w-sm">새로운 상품을 등록하고 판매를 시작하세요.</p>
             <Button onClick={openCreateDialog} variant="outline">
                상품 추가하기
             </Button>
          </div>
        )}
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

      {/* Option Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사이즈 관리</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="text-sm font-medium text-gray-900 mb-4 bg-gray-50 p-3 rounded-lg">
              {selectedProduct.name} {selectedProduct.nameKo && `(${selectedProduct.nameKo})`}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <Input
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="새 사이즈 (예: 270)"
            />
            <Button onClick={handleAddOption} disabled={isSubmitting} className="bg-black text-white px-6">
              추가
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
            {productOptions.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1 text-sm bg-white border border-gray-200 shadow-sm hover:bg-gray-50 h-auto"
              >
                <div className="flex flex-col items-start leading-none gap-1 py-1">
                   <span className="font-medium">{option.size}</span>
                   {option.lowestPrice ? (
                      <span className="text-[10px] text-red-600 font-medium">{new Intl.NumberFormat('ko-KR').format(option.lowestPrice)}원</span>
                   ) : (
                      <span className="text-[10px] text-gray-400">-</span>
                   )}
                </div>
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 rounded-full p-0.5 self-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {productOptions.length === 0 && (
              <div className="w-full text-center py-8 text-gray-400 text-sm">
                  등록된 사이즈가 없습니다.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOptionDialogOpen(false)} className="w-full">
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
              <span className="font-semibold text-black">{selectedProduct?.name}</span> 상품을 삭제하시겠습니까?
              <br />삭제된 상품은 복구할 수 없습니다.
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

      {/* Missing Brand Dialog */}
      <AlertDialog open={missingBrandAlertOpen} onOpenChange={setMissingBrandAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>브랜드가 존재하지 않습니다</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-black">{targetBrandName}</span> 브랜드를 찾을 수 없습니다.<br />
              브랜드 목록 관리에 해당 브랜드를 추가하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogCancel>취소</AlertDialogCancel>
             <AlertDialogAction
               onClick={() => {
                   navigate('/admin/brands', { 
                       state: { 
                           createBrand: true, 
                           initialName: targetBrandName 
                        } 
                    });
               }}
               className="bg-black text-white hover:bg-gray-800"
             >
               브랜드 추가하기
             </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
