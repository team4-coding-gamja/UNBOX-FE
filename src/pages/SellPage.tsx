
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Search, AlertCircle } from 'lucide-react';
import { brandsApi, productsApi, sellingBidsApi } from '@/lib/api';
import { Brand, Product, ProductOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';


type Step = 'brand' | 'product' | 'size' | 'price' | 'complete';

export function SellPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('productId');
  const { user } = useAuth();

  const [step, setStep] = useState<Step>(preselectedProductId ? 'size' : 'brand');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [price, setPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preselectedProductId) {
      fetchProductAndOptions(preselectedProductId);
    } else {
      fetchBrands();
    }
  }, [preselectedProductId]);

  useEffect(() => {
    setSearchQuery(''); // Reset search when step changes
  }, [step]);

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
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }
      
      await sellingBidsApi.create({
        optionId: selectedOption.id,
        price: priceNum,
        userId: Number(user.id),
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

  const renderProgressBar = () => {
    const steps = ['brand', 'product', 'size', 'price'];
    const currentIdx = steps.indexOf(step) === -1 ? 4 : steps.indexOf(step);
    
    return (
      <div className="flex gap-1 mb-8">
        {steps.map((s, idx) => (
          <div 
            key={s} 
            className={cn(
              "h-1 flex-1 transition-colors duration-300", 
              idx <= currentIdx ? "bg-black" : "bg-gray-100"
            )} 
          />
        ))}
      </div>
    );
  };

  if (step === 'complete') {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-sm">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-10 animate-in zoom-in spin-in-12 duration-500 shadow-xl">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter mb-4">COMPLETED</h1>
        <p className="text-gray-500 mb-12 text-lg font-medium">
          판매 입찰이 성공적으로 등록되었습니다.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full text-lg font-bold h-14 bg-black text-white hover:bg-gray-800" onClick={() => navigate('/mypage/sales')}>
            판매 내역 보기
          </Button>
          <Button variant="outline" size="lg" className="w-full text-lg font-bold h-14 border-gray-200" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Filter lists based on search
  const filteredBrands = brands.filter(b => 
    (b.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    (p.nameKo || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.modelNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl min-h-[80vh] bg-white">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-10">
        <Button variant="ghost" size="icon" className="-ml-3 hover:bg-transparent" onClick={handleBack} disabled={step === 'brand' && !preselectedProductId}>
          {step !== 'brand' && <ArrowLeft className="h-6 w-6" />}
        </Button>
        <h1 className="text-xl font-black tracking-tight">
           {step === 'brand' && '브랜드 선택'}
           {step === 'product' && '상품 선택'}
           {step === 'size' && '사이즈 선택'}
           {step === 'price' && '가격 입력'}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {renderProgressBar()}

      {/* Brand Selection */}
      {step === 'brand' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <Input 
              placeholder="브랜드명 검색" 
              className="pl-12 h-14 text-lg rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black placeholder:text-gray-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand)}
                  className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all text-center gap-2 group bg-white"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 mb-2">
                     {brand.logoUrl ? (
                         <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 text-xs font-bold">LOGO</div>
                     )}
                  </div>
                  <span className="font-bold text-lg group-hover:scale-105 transition-transform">{brand.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Selection */}
      {step === 'product' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <Input 
              placeholder="모델명, 모델번호 등" 
              className="pl-12 h-14 text-lg rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black placeholder:text-gray-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
             <div className="space-y-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="flex gap-4">
                   <Skeleton className="w-20 h-20 rounded-xl" />
                   <div className="flex-1 space-y-2 py-2">
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                   </div>
                 </div>
               ))}
             </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="w-full flex items-center gap-5 p-4 border border-gray-100 rounded-2xl hover:border-black transition-all text-left bg-white hover:shadow-md"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-xl p-1 shrink-0 overflow-hidden">
                    <img
                      src={product.imageUrl || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate text-black mb-0.5">{product.name}</p>
                    <p className="text-sm text-gray-500 truncate mb-1">{product.nameKo}</p>
                    <p className="text-xs text-gray-400 font-bold">{product.modelNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-300 flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p className="font-medium">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* Size Selection */}
      {step === 'size' && selectedProduct && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Selected Product Summary Layer */}
           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent">
              <img
                src={selectedProduct.imageUrl || '/placeholder.svg'}
                alt={selectedProduct.name}
                className="w-16 h-16 object-cover rounded-lg mix-blend-multiply"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-black">{selectedProduct.name}</p>
                <p className="text-xs text-gray-400 truncate font-medium">{selectedProduct.modelNumber}</p>
              </div>
           </div>

          <div className="grid grid-cols-3 gap-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className={cn(
                  'h-14 rounded-xl border-2 font-bold text-lg transition-all',
                  selectedOption?.id === option.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-100 hover:border-black text-black'
                )}
              >
                {option.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Input */}
      {step === 'price' && selectedProduct && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Selected Product & Option Summary */}
           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <img
                src={selectedProduct.imageUrl || '/placeholder.svg'}
                alt={selectedProduct.name}
                className="w-16 h-16 object-cover rounded-lg mix-blend-multiply"
              />
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   <p className="font-bold text-sm truncate text-black">{selectedProduct.name}</p>
                   <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-sm whitespace-nowrap">{selectedOption?.size}</span>
                 </div>
                <p className="text-xs text-gray-400 truncate font-medium">{selectedProduct.modelNumber}</p>
              </div>
           </div>

           <div className="py-10">
             <label className="block text-sm font-bold text-black mb-6">판매 희망가 입력</label>
             <div className="relative">
               <input 
                 type="text" 
                 value={price}
                 onChange={(e) => setPrice(formatPrice(e.target.value))}
                 placeholder="0"
                 className="w-full text-5xl md:text-6xl font-black border-b-2 border-gray-200 focus:border-black outline-none py-4 bg-transparent placeholder:text-gray-200 text-right pr-16 transition-colors"
                 autoFocus
               />
               <span className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-black">원</span>
             </div>
             <p className="text-right text-xs text-red-500 font-medium mt-4">⚠️ 즉시 판매가는 현재 지원하지 않습니다 (입찰만 가능)</p>
           </div>

           <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white md:static md:border-0 md:p-0 md:bg-transparent">
             <div className="max-w-xl mx-auto">
               <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl bg-[#41b979] hover:bg-[#3ba86e] text-white" onClick={handleSubmit}>
                 판매 입찰 등록하기
               </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

