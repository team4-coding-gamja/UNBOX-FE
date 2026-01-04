
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
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Banner Section */}
      <section className="relative w-full bg-[#f4f4f4] overscroll-none">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between py-16 md:py-24 lg:py-32">
            <div className="space-y-6 text-center md:text-left z-10 md:max-w-[60%]">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-black leading-[0.9]">
                STYLE YOUR<br />
                <span className="text-gray-400">LIFE</span> WITH<br />
                UNBOX.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-medium max-w-lg mx-auto md:mx-0">
                한정판 스니커즈부터 럭셔리 아이템까지,<br />
                검증된 정품을 안전하게 거래하세요.
              </p>
              <div className="flex justify-center md:justify-start pt-4">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold bg-black text-white hover:bg-gray-800 transition-all">
                  앱 설치하기
                </Button>
              </div>
            </div>
            {/* Visual element */}
             <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none md:opacity-100 md:relative md:w-auto md:flex-1 flex justify-center items-center">
                 <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-gradient-to-br from-gray-200 to-white blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 mt-16 space-y-20">
        
        {/* Brand Filters */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-black">Brands</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <Button
              variant={selectedBrand === null ? 'default' : 'outline'}
              onClick={() => setSelectedBrand(null)}
              className={`rounded-full px-5 h-9 text-sm font-bold border-0 transition-all ${
                selectedBrand === null 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
              }`}
            >
              전체
            </Button>
            {brands.map((brand) => (
              <Button
                key={brand.id}
                variant={selectedBrand === brand.id ? 'default' : 'outline'}
                onClick={() => setSelectedBrand(brand.id)}
                className={`rounded-full px-5 h-9 text-sm font-bold border-0 transition-all ${
                  selectedBrand === brand.id 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
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
              <h2 className="text-xl font-bold tracking-tight text-black mb-1">Most Popular</h2>
              <p className="text-sm text-gray-500">지금 가장 인기 있는 상품</p>
            </div>
            <Button variant="ghost" className="text-sm text-gray-400 hover:text-black font-medium">
              더보기 <ChevronRight className="ml-0.5 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-8 md:gap-x-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-[12px] bg-gray-100" />
                  <div className="space-y-2 px-1">
                    <Skeleton className="h-4 w-20 bg-gray-100" />
                    <Skeleton className="h-4 w-full bg-gray-100" />
                    <Skeleton className="h-4 w-2/3 bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-8 md:gap-x-5">
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
            <div className="flex flex-col items-center justify-center py-32 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Filter className="h-10 w-10 text-gray-300 mb-4" />
              <p className="text-lg font-bold text-gray-500">상품이 없습니다</p>
              <p className="text-sm text-gray-400 mt-1">다른 브랜드를 선택해보세요.</p>
            </div>
          )}
        </section>

        {/* Just Dropped (Only show if no brand selected, for variety) */}
        {!selectedBrand && products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-black mb-1">New Arrivals</h2>
                  <p className="text-sm text-gray-500">새롭게 등록된 상품</p>
                </div>
                <Button variant="ghost" className="text-sm text-gray-400 hover:text-black font-medium">
                  더보기 <ChevronRight className="ml-0.5 h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-8 md:gap-x-5">
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
