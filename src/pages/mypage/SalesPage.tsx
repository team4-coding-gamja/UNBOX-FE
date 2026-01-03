import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellingBidsApi, ordersApi } from '@/lib/api';
import { SellingBid, Order, ORDER_STATUS_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function SalesPage() {
  const [activeTab, setActiveTab] = useState('bids');
  const [bids, setBids] = useState<SellingBid[]>([]);
  const [soldOrders, setSoldOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bidsRes, ordersRes] = await Promise.all([
        sellingBidsApi.getMine(),
        ordersApi.getMine(), // This would need a seller-specific endpoint in real API
      ]);

      const bidsData = bidsRes.data?.data?.content || bidsRes.data?.content || bidsRes.data || [];
      setBids(Array.isArray(bidsData) ? bidsData : []);

      // For demo, filter orders where user is seller (in real app, use seller-specific endpoint)
      const ordersData = ordersRes.data?.data?.content || ordersRes.data?.content || ordersRes.data || [];
      setSoldOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTrackingDialog = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber('');
    setTrackingDialogOpen(true);
  };

  const handleSubmitTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) {
      toast.error('운송장 번호를 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await ordersApi.registerTracking(selectedOrder.id, trackingNumber.trim());
      toast.success('운송장 번호가 등록되었습니다');
      setTrackingDialogOpen(false);
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || '운송장 등록에 실패했습니다';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBidStatusBadge = (status: SellingBid['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="secondary">판매 중</Badge>;
      case 'SOLD':
        return <Badge>판매 완료</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">취소됨</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-8">판매 내역</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">판매 내역</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="bids">판매 입찰</TabsTrigger>
          <TabsTrigger value="sold">판매 완료</TabsTrigger>
        </TabsList>

        <TabsContent value="bids">
          {bids.length > 0 ? (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div key={bid.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img
                        src={bid.product?.imageUrl || '/placeholder.svg'}
                        alt={bid.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getBidStatusBadge(bid.status)}
                      </div>
                      <Link
                        to={`/products/${bid.product?.id}`}
                        className="font-medium hover:underline line-clamp-1"
                      >
                        {bid.product?.nameKo || bid.product?.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {bid.productOption?.size} · {formatDate(bid.createdAt)}
                      </p>
                      <p className="font-bold mt-1">{formatPrice(bid.price)}원</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">판매 입찰 내역이 없습니다</p>
              <Button asChild>
                <Link to="/sell">판매하러 가기</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sold">
          {soldOrders.length > 0 ? (
            <div className="space-y-4">
              {soldOrders.map((order) => (
                <div key={order.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img
                        src={order.product?.imageUrl || '/placeholder.svg'}
                        alt={order.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">
                          {ORDER_STATUS_MAP[order.status]}
                        </Badge>
                      </div>
                      <p className="font-medium line-clamp-1">
                        {order.product?.nameKo || order.product?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.productOption?.size} · {formatDate(order.createdAt)}
                      </p>
                      <p className="font-bold mt-1">{formatPrice(order.price)}원</p>
                    </div>
                  </div>

                  {order.status === 'PENDING_SHIPMENT' && (
                    <>
                      <Separator className="my-4" />
                      <Button
                        size="sm"
                        onClick={() => handleOpenTrackingDialog(order)}
                      >
                        운송장 등록
                      </Button>
                    </>
                  )}

                  {order.trackingNumber && (
                    <>
                      <Separator className="my-4" />
                      <p className="text-sm">
                        <span className="text-muted-foreground">운송장: </span>
                        <span className="font-medium">{order.trackingNumber}</span>
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">판매 완료 내역이 없습니다</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>운송장 등록</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              상품을 발송하고 운송장 번호를 입력해주세요.
            </p>
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">운송장 번호</Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="운송장 번호 입력"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmitTracking} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '등록'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
