import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string, optionId?: string) => void;
}

export function ProductCard({ product, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="group relative">
      <Link to={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="aspect-square bg-[#f4f4f4] rounded-[10px] overflow-hidden mb-3 md:rounded-[12px] relative">
          <img
            src={product.imageUrl || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
          />
        </div>

        {/* Content */}
        <div className="space-y-1">
            {/* Brand */}
            <p className="text-sm font-bold text-black truncate">
            {product.brandName}
            </p>

            {/* Name */}
            <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight">
            {product.name}
            </h3>

            {/* English Name (optional, minimal) */}
            {/* Removed as nameKo is no longer distinct */}

            {/* Price */}
            <div className="pt-2">
                 <p className="text-[15px] font-bold text-black">
                     {product.lowestPrice ? `${formatPrice(product.lowestPrice)}원` : '-'}
                 </p>
                 <p className="text-[11px] text-gray-400">즉시 구매가</p>
            </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      {onToggleWishlist && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 hover:bg-transparent"
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product.id, product.representativeOptionId);
          }}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-colors',
              isWishlisted ? 'fill-black text-black' : 'text-gray-400'
            )}
          />
        </Button>
      )}
    </div>
  );
}
