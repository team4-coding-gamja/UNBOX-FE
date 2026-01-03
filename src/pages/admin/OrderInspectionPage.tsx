import { useState, useEffect } from 'react';
import { adminOrdersApi } from '@/lib/api';
import { Order, ORDER_STATUS_MAP } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';

const statusOptions = [
  { value: 'IN_INSPECTION', label: '검수 중' },
  { value: 'INSPECTION_PASSED', label: '검수 합격' },
  { value: 'INSPECTION_FAILED', label: '검수 불합격' },
  { value: 'SHIPPED_TO_BUYER', label: '구매자 발송' },
  { value: 'DELIVERED', label: '배송 완료' },
];

export function OrderInspectionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminOrdersApi.getAll();
      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('주문 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsSubmitting(true);
    try {
      await adminOrdersApi.updateStatus(selectedOrder.id, newStatus);
      toast.success('주문 상태가 변경되었습니다');
      setDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      const message = error.response?.data?.message || '상태 변경에 실패했습니다';
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'default';
      case 'INSPECTION_PASSED':
        return 'default';
      case 'INSPECTION_FAILED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">주문 검수</h1>

      {orders.length > 0 ? (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">이미지</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>사이즈</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>주문일</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                      <img
                        src={order.product?.imageUrl || '/placeholder.svg'}
                        alt={order.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium line-clamp-1">
                      {order.product?.nameKo || order.product?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.product?.modelNumber}
                    </p>
                  </TableCell>
                  <TableCell>{order.productOption?.size}</TableCell>
                  <TableCell>{formatPrice(order.price)}원</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {ORDER_STATUS_MAP[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openStatusDialog(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 bg-background rounded-lg border border-border">
          <p className="text-muted-foreground">주문이 없습니다</p>
        </div>
      )}

      {/* Status Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 상태 변경</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
                <div className="w-12 h-12 bg-background rounded overflow-hidden shrink-0">
                  <img
                    src={selectedOrder.product?.imageUrl || '/placeholder.svg'}
                    alt={selectedOrder.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm line-clamp-1">
                    {selectedOrder.product?.nameKo || selectedOrder.product?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.productOption?.size} · {formatPrice(selectedOrder.price)}원
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>현재 상태</Label>
                  <p className="text-sm font-medium">
                    {ORDER_STATUS_MAP[selectedOrder.status]}
                  </p>
                </div>

                {selectedOrder.trackingNumber && (
                  <div className="space-y-2">
                    <Label>운송장 번호</Label>
                    <p className="text-sm font-medium">{selectedOrder.trackingNumber}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>배송 정보</Label>
                  <div className="text-sm">
                    <p>{selectedOrder.receiverName} / {selectedOrder.receiverPhone}</p>
                    <p className="text-muted-foreground">
                      ({selectedOrder.zipCode}) {selectedOrder.address} {selectedOrder.addressDetail}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>상태 변경</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isSubmitting || newStatus === selectedOrder?.status}
            >
              {isSubmitting ? '변경 중...' : '변경'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
