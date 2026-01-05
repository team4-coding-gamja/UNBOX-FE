import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown } from 'lucide-react';
import { productsApi, wishlistApi, reviewsApi } from '@/lib/api';
import { Product, ProductOption, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchOptions();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsApi.getById(id!);
      setProduct(response.data?.data || response.data);
    } catch (error) {
      toast.error('상품을 불러오는데 실패했습니다');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await productsApi.getOptions(id!);
      const optionData = response.data?.data || response.data || [];
      setOptions(Array.isArray(optionData) ? optionData : []);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getByProduct(id!);
      const reviewData = response.data?.content || response.data?.data?.content || [];
      setReviews(Array.isArray(reviewData) ? reviewData : []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      navigate('/auth/login');
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistApi.remove(id!);
        setIsWishlisted(false);
        toast.success('위시리스트에서 삭제되었습니다');
      } else {
        await wishlistApi.add(id!);
        setIsWishlisted(true);
        toast.success('위시리스트에 추가되었습니다');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      navigate('/auth/login');
      return;
    }

    if (!selectedOption) {
      toast.error('사이즈를 선택해주세요');
      // Scroll to size selector or open it if it was a modal
      return;
    }

    navigate(`/buy/${id}?optionId=${selectedOption.id}`);
  };

  const handleSell = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      navigate('/auth/login');
      return;
    }

    navigate(`/sell?productId=${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-20">
          <Skeleton className="aspect-square rounded-2xl md:sticky md:top-24" />
          <div className="space-y-6 md:py-8">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const lowestPrice = options.reduce((min, opt) => {
    if (opt.lowestPrice && (!min || opt.lowestPrice < min)) {
      return opt.lowestPrice;
    }
    return min;
  }, 0);

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8 md:py-12 bg-white">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-20">
        
        {/* Left Column: Image (Sticky on Desktop) */}
        <div>
           <div className="sticky top-24">
             <div className="aspect-square bg-[#f4f4f4] rounded-2xl overflow-hidden relative border border-gray-100">
               <img
                 src={product.imageUrl || '/placeholder.svg'}
                 alt={product.name}
                 className="w-full h-full object-cover mix-blend-multiply"
               />
             </div>
           </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col">
          {/* Brand & Titles */}
          <div className="mb-6">
             <a href="#" className="font-bold text-black border-b-2 border-black inline-block leading-tight mb-2 hover:opacity-70 transition-opacity">
               {product.brand?.name}
             </a>
             <h1 className="text-3xl font-medium text-black mb-1 leading-tight tracking-tight">{product.nameKo || product.name}</h1>
             {product.name !== product.nameKo && (
                <p className="text-sm text-gray-400 font-medium">{product.name}</p>
             )}
          </div>

          {/* Size Selector */}
          <div className="mb-8">
             <span className="text-sm font-bold text-gray-900 mb-2 block">사이즈</span>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button 
                   variant="outline" 
                   className="w-full justify-between h-14 rounded-xl border-gray-200 text-base font-bold hover:bg-white hover:border-black transition-all"
                 >
                   <span>{selectedOption ? selectedOption.size : '모든 사이즈'}</span>
                   <ChevronDown className="h-5 w-5 opacity-50" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto p-2">
                 {options.map((option) => (
                   <DropdownMenuItem
                     key={option.id}
                     onClick={() => setSelectedOption(option)}
                     className="flex justify-between items-center py-3 px-4 rounded-lg cursor-pointer focus:bg-gray-50"
                   >
                     <span className={cn("font-medium", selectedOption?.id === option.id && "font-bold")}>
                        {option.size}
                     </span>
                     {option.lowestPrice ? (
                        <span className="text-sm font-bold text-black">{formatPrice(option.lowestPrice)}원</span>
                     ) : (
                        <span className="text-sm text-gray-400">입찰 대기</span>
                     )}
                   </DropdownMenuItem>
                 ))}
               </DropdownMenuContent>
             </DropdownMenu>
          </div>

          {/* Price Summary */}
          <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
             <p className="text-sm text-gray-400">최근 거래가</p>
             <div className="text-right">
                <p className="text-2xl font-bold text-black">
                   {lowestPrice ? `${formatPrice(lowestPrice)}원` : '-'}
                </p>
                <p className="text-[11px] text-green-500 font-medium">배송비 무료 이벤트 중</p>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              className="h-[60px] rounded-[14px] bg-[#ef6253] hover:bg-[#de5445] text-white flex flex-col items-center justify-center gap-0.5 border-0 shadow-sm transition-all"
              onClick={handleBuyNow}
            >
              <div className="flex items-center gap-1">
                 <span className="text-[15px] font-bold">구매</span>
              </div>
              <div className="text-[11px] font-semibold bg-black/10 px-2 py-0.5 rounded-sm">
                 {lowestPrice ? `${formatPrice(lowestPrice)}원` : '가격 미정'}
              </div>
            </Button>

            <Button
              className="h-[60px] rounded-[14px] bg-[#41b979] hover:bg-[#3ba86e] text-white flex flex-col items-center justify-center gap-0.5 border-0 shadow-sm transition-all"
              onClick={handleSell}
            >
              <div className="flex items-center gap-1">
                 <span className="text-[15px] font-bold">판매</span>
              </div>
              <div className="text-[11px] font-semibold bg-black/10 px-2 py-0.5 rounded-sm">
                 즉시 판매가
              </div>
            </Button>
          </div>

          {/* Wishlist */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50 mb-10 transition-colors"
            onClick={handleToggleWishlist}
          >
            <Heart
              className={cn(
                'h-5 w-5 mr-2 transition-colors',
                isWishlisted ? 'fill-black text-black' : 'text-gray-400'
              )}
            />
            관심상품 {isWishlisted ? '삭제' : '추가'}
          </Button>

          {/* Product Details Table */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-black mb-4">상품 정보</h3>
            <div className="border-t border-b border-gray-100 divide-y divide-gray-100">
                <div className="grid grid-cols-[100px_1fr] py-4">
                    <span className="text-sm text-gray-400">모델번호</span>
                    <span className="text-sm font-medium text-black">{product.modelNumber}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] py-4">
                    <span className="text-sm text-gray-400">출시일</span>
                    <span className="text-sm font-medium text-black">{product.releaseDate}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] py-4">
                    <span className="text-sm text-gray-400">발매가</span>
                    <span className="text-sm font-medium text-black">{formatPrice(product.releasePrice)}원</span>
                </div>
            </div>
          </div>

          {/* Reviews Section */}
          <section>
             <h3 className="text-lg font-bold text-black mb-4">스타일 리뷰 <span className="text-gray-400 text-sm font-normal ml-1">({reviews.length})</span></h3>
             {reviews.length > 0 ? (
               <div className="grid gap-4">
                 {reviews.map((review) => (
                   <div key={review.id} className="flex gap-4 items-start pb-6 border-b border-gray-100 last:border-0">
                     <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                     <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-sm">{review.userNickname}</span>
                         <div className="flex text-black text-xs">
                           {Array.from({ length: 5 }).map((_, i) => (
                             <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-20'}>★</span>
                           ))}
                         </div>
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-10 bg-gray-50 rounded-xl">
                 <p className="text-sm text-gray-400">작성된 리뷰가 없습니다.</p>
               </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
}
