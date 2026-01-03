import { useState, useEffect } from 'react';
import { wishlistApi } from '@/lib/api';
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
      const data = response.data || [];
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('위시리스트를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      setWishlist((prev) => prev.filter((item) => item.product?.id !== productId));
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
              onToggleWishlist={() => handleRemove(item.product?.id)}
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
