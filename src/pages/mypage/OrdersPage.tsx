import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi, reviewsApi } from '@/lib/api';
import { Order, ORDER_STATUS_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getMine();
      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('주문 내역을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewDialog = (order: Order) => {
    setSelectedOrder(order);
    setRating(5);
    setReviewContent('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !reviewContent.trim()) {
      toast.error('리뷰 내용을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewsApi.create({
        orderId: selectedOrder.id,
        rating,
        content: reviewContent.trim(),
      });
      toast.success('리뷰가 등록되었습니다');
      setReviewDialogOpen(false);
      fetchOrders(); // Refresh to update reviewWritten status
    } catch (error: any) {
      const message = error.response?.data?.message || '리뷰 등록에 실패했습니다';
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

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'default';
      case 'INSPECTION_FAILED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // 배송 완료 상태인지 확인 (리뷰 작성 가능 여부)
  const canWriteReview = (order: Order) => {
    return order.status === 'DELIVERED' && !order.reviewWritten;
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-8">구매 내역</h1>
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
      <h1 className="text-2xl font-bold mb-8">구매 내역</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
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
                    <Badge variant={getStatusVariant(order.status)}>
                      {ORDER_STATUS_MAP[order.status]}
                    </Badge>
                  </div>
                  <Link
                    to={`/products/${order.product?.id}`}
                    className="font-medium hover:underline line-clamp-1"
                  >
                    {order.product?.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {order.productOption?.productOptionName} · {formatDate(order.createdAt)}
                  </p>
                  <p className="font-bold mt-1">{formatPrice(order.price)}원</p>
                </div>
              </div>

              {/* Review Button - Only show when delivered and no review written */}
              {canWriteReview(order) && (
                <>
                  <Separator className="my-4" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenReviewDialog(order)}
                  >
                    리뷰 작성
                  </Button>
                </>
              )}

              {order.reviewWritten && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">리뷰 작성 완료</p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">구매 내역이 없습니다</p>
          <Button asChild>
            <Link to="/">쇼핑하러 가기</Link>
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 작성</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-12 h-12 bg-background rounded overflow-hidden shrink-0">
                <img
                  src={selectedOrder.product?.imageUrl || '/placeholder.svg'}
                  alt={selectedOrder.product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-sm line-clamp-1">
                  {selectedOrder.product?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedOrder.productOption?.productOptionName}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>평점</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="text-2xl transition-colors"
                  >
                    <span className={i < rating ? 'text-foreground' : 'text-muted-foreground'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewContent">내용</Label>
              <Textarea
                id="reviewContent"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="상품에 대한 솔직한 리뷰를 작성해주세요"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '리뷰 등록'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
