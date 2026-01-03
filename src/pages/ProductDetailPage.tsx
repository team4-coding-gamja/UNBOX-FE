import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown } from 'lucide-react';
import { productsApi, wishlistApi, reviewsApi } from '@/lib/api';
import { Product, ProductOption, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [showSizeSelector, setShowSizeSelector] = useState(false);

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
      setShowSizeSelector(true);
      toast.error('사이즈를 선택해주세요');
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
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
  }, selectedOption?.lowestPrice || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
          <img
            src={product.imageUrl || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div>
          {/* Brand */}
          <p className="text-sm font-bold text-muted-foreground mb-2">
            {product.brand?.nameKo || product.brand?.name}
          </p>

          {/* Name */}
          <h1 className="text-2xl font-bold mb-1">{product.nameKo || product.name}</h1>
          <p className="text-muted-foreground mb-4">{product.name}</p>

          {/* Model Number */}
          <p className="text-sm text-muted-foreground mb-6">{product.modelNumber}</p>

          <Separator className="mb-6" />

          {/* Size Selector */}
          <div className="mb-6">
            <button
              onClick={() => setShowSizeSelector(!showSizeSelector)}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-foreground transition-colors"
            >
              <span className="text-sm font-medium">
                {selectedOption ? `${selectedOption.size}` : '모든 사이즈'}
              </span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 transition-transform',
                  showSizeSelector && 'rotate-180'
                )}
              />
            </button>

            {showSizeSelector && (
              <div className="grid grid-cols-4 gap-2 mt-2 p-4 border border-border rounded-lg">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedOption(option);
                      setShowSizeSelector(false);
                    }}
                    className={cn(
                      'p-3 text-center border rounded-lg transition-colors',
                      selectedOption?.id === option.id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    )}
                  >
                    <p className="text-sm font-medium">{option.size}</p>
                    {option.lowestPrice && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPrice(option.lowestPrice)}원
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              size="lg"
              className="h-14 flex-col items-start px-4"
              onClick={handleBuyNow}
            >
              <span className="text-xs opacity-80">즉시 구매</span>
              <span className="font-bold">
                {lowestPrice ? `${formatPrice(lowestPrice)}원` : '-'}
              </span>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-14 flex-col items-start px-4"
              onClick={handleSell}
            >
              <span className="text-xs opacity-80">판매 입찰</span>
              <span className="font-bold">판매하기</span>
            </Button>
          </div>

          {/* Wishlist */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleToggleWishlist}
          >
            <Heart
              className={cn(
                'h-5 w-5 mr-2',
                isWishlisted && 'fill-destructive text-destructive'
              )}
            />
            관심상품
          </Button>

          <Separator className="my-6" />

          {/* Product Info */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">모델번호</span>
              <span className="font-medium">{product.modelNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">출시일</span>
              <span className="font-medium">{product.releaseDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">발매가</span>
              <span className="font-medium">{formatPrice(product.releasePrice)}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-6">상품 리뷰</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.userNickname}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'text-sm',
                          i < review.rating ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            아직 리뷰가 없습니다
          </p>
        )}
      </section>
    </div>
  );
}
