import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { brandsApi, productsApi, sellingBidsApi } from '@/lib/api';
import { Brand, Product, ProductOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Step = 'brand' | 'product' | 'size' | 'price' | 'complete';

export function SellPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('productId');

  const [step, setStep] = useState<Step>(preselectedProductId ? 'size' : 'brand');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [price, setPrice] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preselectedProductId) {
      fetchProductAndOptions(preselectedProductId);
    } else {
      fetchBrands();
    }
  }, [preselectedProductId]);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const response = await brandsApi.getAll();
      setBrands(response.data?.data || response.data || []);
    } catch (error) {
      toast.error('브랜드 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (brandId: string) => {
    setIsLoading(true);
    try {
      const response = await productsApi.getAll({ brandId });
      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('상품 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductAndOptions = async (productId: string) => {
    setIsLoading(true);
    try {
      const [productRes, optionsRes] = await Promise.all([
        productsApi.getById(productId),
        productsApi.getOptions(productId),
      ]);
      
      const product = productRes.data?.data || productRes.data;
      setSelectedProduct(product);
      
      const optionData = optionsRes.data?.data || optionsRes.data || [];
      setOptions(Array.isArray(optionData) ? optionData : []);
      
      setStep('size');
    } catch (error) {
      toast.error('상품 정보를 불러오는데 실패했습니다');
      navigate('/sell');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await productsApi.getOptions(productId);
      const optionData = response.data?.data || response.data || [];
      setOptions(Array.isArray(optionData) ? optionData : []);
    } catch (error) {
      toast.error('옵션 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setStep('product');
    fetchProducts(brand.id);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setStep('size');
    fetchOptions(product.id);
  };

  const handleOptionSelect = (option: ProductOption) => {
    setSelectedOption(option);
    setStep('price');
  };

  const handleSubmit = async () => {
    if (!selectedOption || !price) {
      toast.error('모든 정보를 입력해주세요');
      return;
    }

    const priceNum = parseInt(price.replace(/,/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('올바른 가격을 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      await sellingBidsApi.create({
        productOptionId: selectedOption.id,
        price: priceNum,
      });
      setStep('complete');
    } catch (error: any) {
      const message = error.response?.data?.message || '판매 등록에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'product') {
      setStep('brand');
      setSelectedBrand(null);
    } else if (step === 'size') {
      if (preselectedProductId) {
        navigate(-1);
      } else {
        setStep('product');
        setSelectedProduct(null);
      }
    } else if (step === 'price') {
      setStep('size');
      setSelectedOption(null);
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? parseInt(num, 10).toLocaleString('ko-KR') : '';
  };

  const steps = [
    { key: 'brand', label: '브랜드' },
    { key: 'product', label: '상품' },
    { key: 'size', label: '사이즈' },
    { key: 'price', label: '가격' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  if (step === 'complete') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-background" />
        </div>
        <h1 className="text-2xl font-bold mb-2">판매 입찰 등록 완료</h1>
        <p className="text-muted-foreground mb-8">
          구매자가 나타나면 알림을 보내드립니다
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/mypage/sales')}>
            판매 내역 보기
          </Button>
          <Button onClick={() => navigate('/')}>홈으로</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">판매하기</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                i <= currentStepIndex
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-1',
                  i < currentStepIndex ? 'bg-foreground' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'brand' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">브랜드 선택</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand)}
                  className="p-4 text-left border border-border rounded-lg hover:border-foreground transition-colors"
                >
                  <p className="font-medium">{brand.nameKo || brand.name}</p>
                  <p className="text-sm text-muted-foreground">{brand.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'product' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">상품 선택</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="w-full flex items-center gap-4 p-4 border border-border rounded-lg hover:border-foreground transition-colors"
                >
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                    <img
                      src={product.imageUrl || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{product.nameKo || product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.modelNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">상품이 없습니다</p>
          )}
        </div>
      )}

      {step === 'size' && (
        <div>
          {selectedProduct && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-6">
              <div className="w-16 h-16 bg-background rounded-lg overflow-hidden shrink-0">
                <img
                  src={selectedProduct.imageUrl || '/placeholder.svg'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{selectedProduct.nameKo || selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">{selectedProduct.modelNumber}</p>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">사이즈 선택</h2>
          {isLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : options.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    'p-3 text-center border rounded-lg transition-colors',
                    selectedOption?.id === option.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  )}
                >
                  <p className="font-medium">{option.size}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">사이즈 옵션이 없습니다</p>
          )}
        </div>
      )}

      {step === 'price' && (
        <div>
          {selectedProduct && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-6">
              <div className="w-16 h-16 bg-background rounded-lg overflow-hidden shrink-0">
                <img
                  src={selectedProduct.imageUrl || '/placeholder.svg'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{selectedProduct.nameKo || selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.modelNumber} · {selectedOption?.size}
                </p>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">판매 희망가</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">가격</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(formatPrice(e.target.value))}
                  placeholder="희망 판매가 입력"
                  className="text-right pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading || !price}
            >
              {isLoading ? '등록 중...' : '판매 입찰 등록'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
