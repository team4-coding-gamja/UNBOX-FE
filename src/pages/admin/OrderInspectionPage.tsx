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

import { ClipboardList, X } from 'lucide-react';

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
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'INSPECTION_PASSED':
      case 'SHIPPED_TO_BUYER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_INSPECTION':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'INSPECTION_FAILED':
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
             <Skeleton className="h-8 w-40 mb-2" />
             <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">주문 검수</h1>
           <p className="text-gray-500 mt-1 text-sm">주문 검수 상태를 관리하고 배송을 처리합니다.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase text-gray-500 w-[100px]">Product</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Details</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Size</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Price</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Status</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Date</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={order.product?.imageUrl || '/placeholder.svg'}
                        alt={order.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-semibold text-gray-900 line-clamp-1">
                        {order.product?.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {order.product?.modelNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-700">{order.productOption?.productOptionName}</TableCell>
                  <TableCell className="font-medium">{formatPrice(order.price)}원</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusVariant(order.status)} border rounded-full px-3 py-0.5 font-normal`}>
                      {ORDER_STATUS_MAP[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => openStatusDialog(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <ClipboardList className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">처리할 주문이 없습니다</h3>
             <p className="text-gray-500 mt-1 max-w-sm">검수 대기중인 주문이 없거나 처리가 완료되었습니다.</p>
          </div>
        )}
      </div>

      {/* Status Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>주문 상세 및 검수</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <img
                    src={selectedOrder.product?.imageUrl || '/placeholder.svg'}
                    alt={selectedOrder.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900 line-clamp-1">
                    {selectedOrder.product?.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedOrder.productOption?.productOptionName} · {formatPrice(selectedOrder.price)}원
                  </div>
                  <Badge variant="outline" className={`mt-2 ${getStatusVariant(selectedOrder.status)} border rounded-full px-3 py-0.5 font-normal`}>
                      {ORDER_STATUS_MAP[selectedOrder.status]}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {selectedOrder.trackingNumber ? (
                   <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500 col-span-1">운송장 번호</span>
                      <span className="col-span-2 font-medium">{selectedOrder.trackingNumber}</span>
                   </div>
                ) : null}

                <div className="grid grid-cols-3 gap-2 text-sm">
                   <span className="text-gray-500 col-span-1">배송 정보</span>
                   <div className="col-span-2 space-y-1">
                      <p className="font-medium">{selectedOrder.receiverName} / {selectedOrder.receiverPhone}</p>
                      <p className="text-gray-600">({selectedOrder.zipCode}) {selectedOrder.address} {selectedOrder.addressDetail}</p>
                   </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <Label className="text-gray-900 font-semibold mb-2 block">검수 상태 변경</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="h-11">
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
            </div>
          )}

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11">
              취소
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isSubmitting || newStatus === selectedOrder?.status}
              className="bg-black text-white hover:bg-gray-800 h-11 px-8"
            >
              {isSubmitting ? '변경 중...' : '변경 내용 저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
