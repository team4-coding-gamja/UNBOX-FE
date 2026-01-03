import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { productsApi, ordersApi } from '@/lib/api';
import { Product, ProductOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type Step = 'size' | 'shipping' | 'payment' | 'complete';

const shippingSchema = z.object({
  receiverName: z.string().min(1, '수령인 이름을 입력해주세요'),
  receiverPhone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호를 입력해주세요'),
  zipCode: z.string().min(5, '우편번호를 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  addressDetail: z.string().min(1, '상세주소를 입력해주세요'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export function BuyPage() {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const preselectedOptionId = searchParams.get('optionId');
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(preselectedOptionId ? 'shipping' : 'size');
  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [sellingBidId, setSellingBidId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  useEffect(() => {
    if (productId) {
      fetchProductAndOptions();
    }
  }, [productId]);

  const fetchProductAndOptions = async () => {
    setIsLoading(true);
    try {
      const [productRes, optionsRes] = await Promise.all([
        productsApi.getById(productId!),
        productsApi.getOptions(productId!),
      ]);

      const productData = productRes.data?.data || productRes.data;
      setProduct(productData);

      const optionData = optionsRes.data?.data || optionsRes.data || [];
      const optionsList = Array.isArray(optionData) ? optionData : [];
      setOptions(optionsList);

      // If option is preselected, find it
      if (preselectedOptionId) {
        const option = optionsList.find((o: ProductOption) => o.id === preselectedOptionId);
        if (option) {
          setSelectedOption(option);
          // For now, assume sellingBidId is part of the option or we'll handle it later
          setSellingBidId(option.lowestBidId || preselectedOptionId);
        }
      }
    } catch (error) {
      toast.error('상품 정보를 불러오는데 실패했습니다');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option: ProductOption) => {
    if (!option.lowestPrice) {
      toast.error('현재 판매 중인 상품이 없습니다');
      return;
    }
    setSelectedOption(option);
    setSellingBidId(option.lowestBidId || option.id);
    setStep('shipping');
  };

  const onShippingSubmit = (data: ShippingFormData) => {
    // Store shipping data and move to payment
    localStorage.setItem('shippingData', JSON.stringify(data));
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!selectedOption || !sellingBidId) {
      toast.error('상품을 선택해주세요');
      return;
    }

    const shippingData = localStorage.getItem('shippingData');
    if (!shippingData) {
      toast.error('배송 정보를 입력해주세요');
      setStep('shipping');
      return;
    }

    const shipping = JSON.parse(shippingData);
    setIsLoading(true);

    try {
      const response = await ordersApi.create({
        sellingBidId,
        ...shipping,
      });
      
      const newOrderId = response.data?.data || response.data;
      setOrderId(newOrderId);
      localStorage.removeItem('shippingData');
      setStep('complete');
    } catch (error: any) {
      const message = error.response?.data?.message || '주문에 실패했습니다';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'shipping') {
      if (preselectedOptionId) {
        navigate(-1);
      } else {
        setStep('size');
      }
    } else if (step === 'payment') {
      setStep('shipping');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isLoading && !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-24 w-full rounded-lg mb-6" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-background" />
        </div>
        <h1 className="text-2xl font-bold mb-2">주문 완료</h1>
        <p className="text-muted-foreground mb-8">
          결제가 완료되었습니다. 판매자가 상품을 발송하면 알림을 보내드립니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/mypage/orders')}>
            주문 내역 보기
          </Button>
          <Button onClick={() => navigate('/')}>홈으로</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">즉시 구매</h1>
      </div>

      {/* Product Info */}
      {product && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-6">
          <div className="w-20 h-20 bg-background rounded-lg overflow-hidden shrink-0">
            <img
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium">{product.nameKo || product.name}</p>
            <p className="text-sm text-muted-foreground">{product.modelNumber}</p>
            {selectedOption && (
              <p className="text-sm font-medium mt-1">사이즈: {selectedOption.size}</p>
            )}
          </div>
          {selectedOption?.lowestPrice && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">구매가</p>
              <p className="font-bold">{formatPrice(selectedOption.lowestPrice)}원</p>
            </div>
          )}
        </div>
      )}

      {/* Step Content */}
      {step === 'size' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">사이즈 선택</h2>
          <div className="grid grid-cols-4 gap-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                disabled={!option.lowestPrice}
                className={cn(
                  'p-3 text-center border rounded-lg transition-colors',
                  option.lowestPrice
                    ? 'border-border hover:border-foreground cursor-pointer'
                    : 'border-border opacity-50 cursor-not-allowed'
                )}
              >
                <p className="font-medium">{option.size}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {option.lowestPrice ? `${formatPrice(option.lowestPrice)}원` : '-'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'shipping' && (
        <form onSubmit={handleSubmit(onShippingSubmit)}>
          <h2 className="text-lg font-semibold mb-4">배송 정보</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiverName">수령인</Label>
              <Input
                id="receiverName"
                {...register('receiverName')}
                placeholder="수령인 이름"
              />
              {errors.receiverName && (
                <p className="text-xs text-destructive">{errors.receiverName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverPhone">연락처</Label>
              <Input
                id="receiverPhone"
                {...register('receiverPhone')}
                placeholder="010-0000-0000"
              />
              {errors.receiverPhone && (
                <p className="text-xs text-destructive">{errors.receiverPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">우편번호</Label>
              <Input
                id="zipCode"
                {...register('zipCode')}
                placeholder="12345"
              />
              {errors.zipCode && (
                <p className="text-xs text-destructive">{errors.zipCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="주소"
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressDetail">상세주소</Label>
              <Input
                id="addressDetail"
                {...register('addressDetail')}
                placeholder="상세주소"
              />
              {errors.addressDetail && (
                <p className="text-xs text-destructive">{errors.addressDetail.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg">
              다음
            </Button>
          </div>
        </form>
      )}

      {step === 'payment' && selectedOption && (
        <div>
          <h2 className="text-lg font-semibold mb-4">결제</h2>
          
          <div className="p-4 border border-border rounded-lg mb-6">
            <h3 className="font-medium mb-3">주문 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품 금액</span>
                <span>{formatPrice(selectedOption.lowestPrice || 0)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">검수비</span>
                <span>무료</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">배송비</span>
                <span>무료</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>총 결제금액</span>
                <span>{formatPrice(selectedOption.lowestPrice || 0)}원</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : `${formatPrice(selectedOption.lowestPrice || 0)}원 결제하기`}
          </Button>
        </div>
      )}
    </div>
  );
}
