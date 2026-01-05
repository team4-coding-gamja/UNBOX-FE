import { useState, useEffect } from 'react';
import { wishlistApi, productsApi } from '@/lib/api';
import { WishlistItem } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistApi.getAll();
      const items = response.data?.data || response.data || [];
      const data = Array.isArray(items) ? items : [];

      const enrichedItems = await Promise.all(data.map(async (item: any) => {
          // item is WishlistResponseDTO (flat: productId, productName, etc.)
          // We need to fetch full product details + options for price
          try {
              const productRes = await productsApi.getById(item.productId);
              const product = productRes.data?.data || productRes.data;

              // Calculate lowest price
              let lowestPrice = 0;
              try {
                  const optionsRes = await productsApi.getOptions(item.productId);
                  const options = optionsRes.data?.data || optionsRes.data || [];
                  if (Array.isArray(options)) {
                      lowestPrice = options.reduce((min: number, opt: any) => {
                          if (opt.lowestPrice && (!min || opt.lowestPrice < min)) {
                              return opt.lowestPrice;
                          }
                          return min;
                      }, 0);
                  }
              } catch (e) { /* ignore option fetch error */ }

              const fullProduct = {
                  ...product,
                  lowestPrice: lowestPrice || product.lowestPrice || 0
              };

              return {
                  id: item.wishlistId,
                  product: fullProduct,
                  createdAt: new Date().toISOString() // Mock date if missing
              };
          } catch (e) {
              // specific product fetch failed, fallback to DTO data
              return {
                  id: item.wishlistId,
                  product: {
                    id: item.productId,
                    name: item.productName,
                    imageUrl: item.imageUrl,
                    brandName: 'Unknown', // missing in DTO
                    lowestPrice: 0
                  },
                  createdAt: new Date().toISOString()
              };
          }
      }));

      setWishlist(enrichedItems);
    } catch (error) {
      toast.error('위시리스트를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (wishlistId: string) => {
    try {
      await wishlistApi.remove(wishlistId);
      setWishlist((prev) => prev.filter((item) => item.id !== wishlistId));
      toast.success('위시리스트에서 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-8">위시리스트</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">위시리스트</h1>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              isWishlisted={true}
              onToggleWishlist={() => handleRemove(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">위시리스트가 비어있습니다</p>
        </div>
      )}
    </div>
  );
}
