import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminProductRequestsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Box, Check, X, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ProductRequest {
  id: string;
  userId: number;
  name: string;
  brandName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export function ProductRequestManagementPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await adminProductRequestsApi.getAll({ page: 0, size: 50 });
      const data = response.data?.data?.content || response.data?.content || response.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('요청 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      await adminProductRequestsApi.updateStatus(id, status);
      toast.success(status === 'APPROVED' ? '요청을 승인했습니다' : '요청을 거절했습니다');
      fetchRequests();
    } catch (error: any) {
      toast.error('상태 변경에 실패했습니다');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch(e) {
        return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">상품 등록 요청</h1>
           <p className="text-gray-500 mt-1 text-sm">사용자들이 요청한 상품 등록 내역을 관리합니다.</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={fetchRequests}>
          새로고침
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {requests.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase text-gray-500">Status</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Brand</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Product Name</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">User ID</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase text-gray-500">Date</TableHead>
                <TableHead className="w-32 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 py-4">
                    {req.status === 'PENDING' ? (
                        <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">대기중</Badge>
                    ) : req.status === 'APPROVED' ? (
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">승인됨</Badge>
                    ) : (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">거절됨</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{req.brandName}</TableCell>
                  <TableCell className="text-gray-600">{req.name}</TableCell>
                  <TableCell className="font-mono text-gray-500">#{req.userId}</TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(req.createdAt)}</TableCell>
                  <TableCell className="text-right pr-6">
                    {req.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full"
                            onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                            disabled={!!processingId}
                            title="승인"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                            disabled={!!processingId}
                            title="거절"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        </div>
                    )}
                    {req.status === 'APPROVED' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            onClick={() => navigate('/admin/products', { 
                                state: { 
                                    createProduct: true, 
                                    initialName: req.name,
                                    initialBrandName: req.brandName 
                                } 
                            })}
                            title="상품 등록하러 가기"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Box className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">상품 등록 요청이 없습니다</h3>
          </div>
        )}
      </div>
    </div>
  );
}
