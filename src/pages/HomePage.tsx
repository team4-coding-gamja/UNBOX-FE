import { useState, useEffect } from 'react';
import { productsApi, brandsApi, wishlistApi } from '@/lib/api';
import { Product, Brand } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-muted rounded-2xl p-8 md:p-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            한정판 스니커즈
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            검증된 정품만을 거래하는 프리미엄 리셀 플랫폼
          </p>
        </div>
      </section>

      {/* Brand Filter */}
      <section className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedBrand === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBrand(null)}
            className="shrink-0"
          >
            전체
          </Button>
          {brands.map((brand) => (
            <Button
              key={brand.id}
              variant={selectedBrand === brand.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBrand(brand.id)}
              className="shrink-0"
            >
              {brand.nameKo || brand.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <h2 className="text-xl font-bold mb-6">상품</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">등록된 상품이 없습니다</p>
          </div>
        )}
      </section>
    </div>
  );
}
