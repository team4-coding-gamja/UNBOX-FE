import { useState, useEffect } from 'react';
import { productsApi, brandsApi, wishlistApi } from '@/lib/api';
import { Product, Brand } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ChevronRight, Filter } from 'lucide-react';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchBrands();
    fetchProducts();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const response = await brandsApi.getAll();
      setBrands(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = selectedBrand ? { brandId: selectedBrand } : {};
      const response = await productsApi.getAll(params);
      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await wishlistApi.getAll();
      const items = response.data || [];
      setWishlist(new Set(items.map((item: any) => item.product?.id || item.productId)));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      if (wishlist.has(productId)) {
        await wishlistApi.remove(productId);
        setWishlist((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.success('위시리스트에서 삭제되었습니다');
      } else {
        await wishlistApi.add(productId);
        setWishlist((prev) => new Set(prev).add(productId));
        toast.success('위시리스트에 추가되었습니다');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Banner Section */}
      <section className="relative w-full bg-[#f4f4f4]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-20 lg:py-24">
            <div className="space-y-6 text-center md:text-left md:max-w-[50%]">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground">
                STYLE YOUR <br className="hidden md:block" />
                <span className="text-primary">LIFE</span>
              </h1>
              <p className="text-lg text-muted-foreground md:pr-10">
                한정판 스니커즈부터 럭셔리 아이템까지, <br className="md:hidden" /> 
                검증된 정품을 안전하게 거래하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button size="lg" className="rounded-full px-8 text-base font-semibold">
                  앱 설치하기
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base font-semibold">
                  이용 가이드
                </Button>
              </div>
            </div>
            {/* Abstract Visual / Image Placeholder */}
            <div className="mt-10 md:mt-0 w-full md:w-[45%] flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-2xl flex items-center justify-center overflow-hidden">
                <span className="text-4xl font-black text-gray-300 dark:text-gray-700 select-none">UNBOX</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 mt-12 space-y-16">
        
        {/* Brand Filters / Category */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
            <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
              ALL BRANDS <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <Button
              variant={selectedBrand === null ? 'default' : 'secondary'}
              onClick={() => setSelectedBrand(null)}
              className={`rounded-full px-6 font-semibold transition-all ${
                selectedBrand === null ? 'shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              전체
            </Button>
            {brands.map((brand) => (
              <Button
                key={brand.id}
                variant={selectedBrand === brand.id ? 'default' : 'secondary'}
                onClick={() => setSelectedBrand(brand.id)}
                className={`rounded-full px-6 font-semibold transition-all ${
                  selectedBrand === brand.id 
                    ? 'shadow-md' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {brand.nameKo || brand.name}
              </Button>
            ))}
          </div>
        </section>

        {/* Most Popular Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Most Popular</h2>
              <p className="text-sm text-muted-foreground">지금 가장 인기 있는 상품</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex text-sm text-muted-foreground hover:text-foreground">
              더보기 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.has(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border border-dashed">
              <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">등록된 상품이 없습니다</p>
              <p className="text-sm text-muted-foreground mt-1">다른 브랜드를 선택하거나 나중에 다시 확인해주세요.</p>
            </div>
          )}
        </section>

        {/* Just Dropped Section (Mock using same data for design demo) */}
        {!selectedBrand && products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Just Dropped</h2>
                  <p className="text-sm text-muted-foreground">발매된 최신 상품</p>
                </div>
                <Button variant="ghost" className="hidden sm:flex text-sm text-muted-foreground hover:text-foreground">
                  더보기 <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
               {products.slice(0, 5).map((product) => (
                <ProductCard
                  key={`dropped-${product.id}`}
                  product={product}
                  isWishlisted={wishlist.has(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
