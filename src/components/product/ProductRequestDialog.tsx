import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { productRequestsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Box } from 'lucide-react';

const requestSchema = z.object({
  brandName: z.string().min(1, '브랜드명을 입력해주세요').max(50, '브랜드명은 50자 이내여야 합니다'),
  name: z.string().min(1, '상품명을 입력해주세요').max(100, '상품명은 100자 이내여야 합니다'),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface ProductRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductRequestDialog({ open, onOpenChange }: ProductRequestDialogProps) {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    if (!isAuthenticated) {
        toast.error('로그인이 필요한 서비스입니다.');
        return;
    }

    setIsSubmitting(true);
    try {
      await productRequestsApi.create({
          name: data.name,
          brandName: data.brandName
      });
      toast.success('상품 등록 요청이 접수되었습니다.');
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '요청 접수에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            상품 등록 요청
          </DialogTitle>
          <DialogDescription>
            찾으시는 상품이 없나요? 상품 정보를 입력해주시면 빠르게 등록해드리겠습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandName">브랜드명</Label>
            <Input 
                id="brandName" 
                placeholder="예: Nike, Adidas" 
                {...register('brandName')} 
            />
            {errors.brandName && (
              <p className="text-xs text-red-500">{errors.brandName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">상품명</Label>
            <Input 
                id="name" 
                placeholder="예: Air Jordan 1 Retro High OG" 
                {...register('name')} 
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-black text-white hover:bg-gray-800">
              {isSubmitting ? '요청 중...' : '요청하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
