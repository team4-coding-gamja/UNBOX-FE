import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { productsApi, ordersApi, paymentApi } from '@/lib/api';
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
          setSellingBidId(option.id);
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
    // As per new spec, lowestBidId is not available. Using option.id as fallback placeholder
    setSellingBidId(option.id);
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
      // 1. Create Order
      const orderRes = await ordersApi.create({
        sellingBidId,
        ...shipping,
      });
      
      const orderData = orderRes.data?.data || orderRes.data;
      const createdOrderId = orderData?.orderId || orderData?.id;

      if (!createdOrderId) {
          throw new Error('주문 생성에 실패했습니다 (Order ID not returned)');
      }

      // 2. Payment Ready
      const readyRes = await paymentApi.ready({ orderId: createdOrderId, method: 'CARD' });
      const readyData = readyRes.data?.data || readyRes.data;
      const { paymentId, paymentKey } = readyData;

      if (!paymentId || !paymentKey) {
          throw new Error('결제 정보 생성에 실패했습니다');
      }

      // 3. Payment Confirm
      await paymentApi.confirm({ paymentId, paymentKey });
      
      setOrderId(createdOrderId);
      localStorage.removeItem('shippingData');
      setStep('complete');
    } catch (error: any) {
      console.error('Payment flow error:', error);
      const message = error.response?.data?.message || '주문 처리에 실패했습니다';
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
      <div className="container mx-auto px-4 py-8 max-w-2xl bg-white min-h-screen">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-24 w-full rounded-lg mb-6" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-sm">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-10 animate-in zoom-in spin-in-12 duration-500 shadow-xl">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter mb-4">ORDER COMPLETED</h1>
        <p className="text-gray-500 mb-12 text-lg font-medium">
          주문이 성공적으로 완료되었습니다.<br/>
          판매자가 상품을 발송하면 알림을 보내드립니다.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full text-lg font-bold h-14 bg-black text-white hover:bg-gray-800" onClick={() => navigate('/mypage/orders')}>
            주문 내역 보기
          </Button>
          <Button variant="outline" size="lg" className="w-full text-lg font-bold h-14 border-gray-200" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-3 hover:bg-transparent">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">
           {step === 'size' && '사이즈 선택'}
           {step === 'shipping' && '배송 정보 입력'}
           {step === 'payment' && '결제 및 주문 확인'}
        </h1>
      </div>

      {/* Product Info */}
      {product && (
        <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl mb-8 border border-transparent">
          <div className="w-20 h-20 bg-background rounded-xl overflow-hidden shrink-0 border border-gray-100">
            <img
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply"
            />
          </div>
          <div className="flex-1">
            <p className="font-bold text-black mb-1">{product.name}</p>
            <p className="text-xs text-gray-500 font-medium mb-2">{product.modelNumber}</p>
            {selectedOption && (
               <div className="inline-flex items-center px-2 py-0.5 rounded-sm bg-black text-white text-xs font-bold">
                  {selectedOption.productOptionName}
               </div>
            )}
          </div>
          {selectedOption?.lowestPrice && (
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium mb-1">구매가</p>
              <p className="font-bold text-lg">{formatPrice(selectedOption.lowestPrice)}원</p>
            </div>
          )}
        </div>
      )}

      {/* Step Content */}
      {step === 'size' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-3 gap-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                disabled={!option.lowestPrice}
                className={cn(
                  'p-4 text-center border rounded-xl transition-all h-20 flex flex-col items-center justify-center gap-1',
                  option.lowestPrice
                    ? 'border-gray-200 hover:border-black cursor-pointer bg-white hover:shadow-md'
                    : 'border-gray-100 opacity-40 cursor-not-allowed bg-gray-50'
                )}
              >
                <p className="font-bold text-lg">{option.productOptionName}</p>
                <p className="text-xs font-bold text-[#ef6253]">
                  {option.lowestPrice ? `${formatPrice(option.lowestPrice)}원` : '품절'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'shipping' && (
        <form onSubmit={handleSubmit(onShippingSubmit)} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className="space-y-4">
               <h3 className="font-bold text-lg">주소 입력</h3>
               
               <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="receiverName" className="font-bold ml-1">수령인</Label>
                    <Input id="receiverName" {...register('receiverName')} placeholder="이름을 입력하세요" className="h-12 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black" />
                    {errors.receiverName && <p className="text-xs text-red-500 ml-1">{errors.receiverName.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="receiverPhone" className="font-bold ml-1">연락처</Label>
                    <Input id="receiverPhone" {...register('receiverPhone')} placeholder="- 없이 숫자만 입력" className="h-12 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black" />
                    {errors.receiverPhone && <p className="text-xs text-red-500 ml-1">{errors.receiverPhone.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="grid gap-2">
                        <Label htmlFor="zipCode" className="font-bold ml-1">우편번호</Label>
                        <Input id="zipCode" {...register('zipCode')} placeholder="우편번호" className="h-12 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black" />
                     </div>
                  </div>
                  {errors.zipCode && <p className="text-xs text-red-500 ml-1">{errors.zipCode.message}</p>}

                  <div className="grid gap-2">
                    <Label htmlFor="address" className="font-bold ml-1">주소</Label>
                    <Input id="address" {...register('address')} placeholder="주소 검색" className="h-12 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black" />
                    {errors.address && <p className="text-xs text-red-500 ml-1">{errors.address.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="addressDetail" className="font-bold ml-1">상세주소</Label>
                    <Input id="addressDetail" {...register('addressDetail')} placeholder="상세주소 입력" className="h-12 rounded-xl bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-black" />
                    {errors.addressDetail && <p className="text-xs text-red-500 ml-1">{errors.addressDetail.message}</p>}
                  </div>
               </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl bg-black hover:bg-gray-800" size="lg">
              다음 단계로
            </Button>
          </div>
        </form>
      )}

      {step === 'payment' && selectedOption && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="p-6 border border-gray-100 rounded-2xl mb-8 bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-6">최종 결제 금액</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-gray-500">
                <span>상품 금액</span>
                <span className="text-black">{formatPrice(selectedOption.lowestPrice || 0)}원</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>검수비</span>
                <span className="text-black">무료</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>배송비</span>
                <span className="text-black">무료</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">총 결제금액</span>
                <span className="text-2xl font-black text-[#ef6253]">{formatPrice(selectedOption.lowestPrice || 0)}원</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-8 flex items-start gap-3">
             <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
             <div className="text-xs text-gray-500">
                <p className="font-bold text-gray-700 mb-1">안전 결제</p>
                <p>UNBOX는 에스크로 결제를 통해 안전한 거래를 보장합니다.</p>
             </div>
          </div>

          <Button
            className="w-full h-14 text-lg font-bold rounded-xl bg-[#ef6253] hover:bg-[#de5445] text-white"
            size="lg"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? '결제 처리 중...' : '결제하기'}
          </Button>
        </div>
      )}
    </div>
  );
}
