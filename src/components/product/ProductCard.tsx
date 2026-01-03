import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export function ProductCard({ product, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="group relative">
      <Link to={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
          <img
            src={product.imageUrl || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Brand */}
        <p className="text-xs font-bold text-muted-foreground mb-1">
          {product.brand?.nameKo || product.brand?.name}
        </p>

        {/* Name */}
        <h3 className="text-sm font-medium line-clamp-2 mb-1 group-hover:underline">
          {product.nameKo || product.name}
        </h3>

        {/* English Name */}
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {product.name}
        </p>

        {/* Price */}
        <div>
          <p className="text-xs text-muted-foreground">즉시 구매가</p>
          <p className="text-base font-bold">
            {product.lowestPrice ? `${formatPrice(product.lowestPrice)}원` : '-'}
          </p>
        </div>
      </Link>

      {/* Wishlist Button */}
      {onToggleWishlist && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product.id);
          }}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'
            )}
          />
        </Button>
      )}
    </div>
  );
}
