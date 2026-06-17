import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Send,
  Clock,
  FileText,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { LoadingOverlay, Empty } from '../components/common/Empty';
import { classNames, formatDate, getStatusText } from '../utils';

export const SparePartRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sparePartRequests, devices, user, updateSparePartRequest, updateSparePartStock } =
    useAppStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const request = useMemo(
    () => sparePartRequests.find((r) => r.id === id),
    [sparePartRequests, id]
  );

  const device = useMemo(
    () => devices.find((d) => d.id === request?.deviceId),
    [devices, request]
  );

  const canApprove =
    (user?.role === 'admin' ||
      user?.role === 'storekeeper') &&
    request?.status === 'pending';

  const handleApprove = async () => {
    if (!request) return;

    setIsSubmitting(true);

    try {
      await updateSparePartRequest(request.id, {
        status: 'approved',
        approverId: user?.id,
        approverName: user?.realName,
        approvedAt: new Date().toISOString(),
      });

      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Approve error:', error);
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!request || !rejectReason.trim()) return;

    setIsSubmitting(true);

    try {
      request.items.forEach((item) => {
        const partId = item.partId ?? item.sparePartId;
        const qty = Number(item.quantity ?? 0) || 0;
        if (partId && qty > 0) {
          updateSparePartStock(partId, -qty);
        }
      });

      await updateSparePartRequest(request.id, {
        status: 'rejected',
        approverId: user?.id,
        approverName: user?.realName,
        approvedAt: new Date().toISOString(),
        rejectReason: rejectReason.trim(),
      });

      setShowRejectModal(false);
      setRejectReason('');

      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Reject error:', error);
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!request) return;

    setIsSubmitting(true);

    try {
      await updateSparePartRequest(request.id, {
        status: 'completed',
        deliveredAt: new Date().toISOString(),
      });

      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Complete error:', error);
      setIsSubmitting(false);
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="领用单不存在" description="该领用单可能已被删除" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="领用单详情" />

      <div className="px-4 py-4 space-y-4">
        <div
          className={classNames(
            'rounded-2xl p-5 text-white shadow-lg',
            request.status === 'approved' || request.status === 'completed'
              ? 'bg-gradient-to-r from-success-500 to-success-600'
              : request.status === 'rejected'
              ? 'bg-gradient-to-r from-danger-500 to-danger-600'
              : 'bg-gradient-to-r from-warning-500 to-warning-600'
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Package size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{request.requestNo}</h1>
                <p className="text-white/80 text-sm mt-0.5">{request.purpose}</p>
              </div>
            </div>
            <StatusBadge status={getStatusText(request.status)} variant="light" />
          </div>
          <p className="text-white/90 text-sm">
            {request.purposeDetail || `用于 ${request.purpose}，共 ${request.items.length} 项备件`}
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <User size={18} className="mr-2 text-primary-500" />
              申请人信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400">姓名</p>
                <p className="font-medium text-neutral-700">
                  {request.requesterName}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">部门</p>
                <p className="font-medium text-neutral-700">
                  {request.requesterDepartment}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">申请时间</p>
                <p className="font-medium text-neutral-700">
                  {formatDate(new Date(request.createdAt), 'YYYY-MM-DD HH:mm')}
                </p>
              </div>
              {device && (
                <div>
                  <p className="text-xs text-neutral-400">使用设备</p>
                  <p className="font-medium text-neutral-700">
                    {device.name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Package size={18} className="mr-2 text-primary-500" />
              备件清单
            </h3>
            <div className="space-y-3">
              {request.items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-neutral-50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-700">
                        {item.partName ?? item.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.partCode ?? ''} · {item.specification ?? ''}
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <p className="text-sm font-medium text-neutral-700">
                        {Number(item.quantity ?? 0) || 0} {item.unit}
                      </p>
                      <p className="text-xs text-primary-500">
                        ¥{(Number(item.unitPrice ?? 0) || 0).toFixed(2)}/{item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                    <span className="text-xs text-neutral-400">小计</span>
                    <span className="text-sm font-bold text-primary-600">
                      ¥{((Number(item.unitPrice ?? 0) || 0) * (Number(item.quantity ?? 0) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-600">备件总数</span>
                <span className="text-sm font-medium text-neutral-700">
                  {request.items.reduce((sum, item) => sum + (Number(item.quantity ?? 0) || 0), 0)} 件
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-700">
                  合计金额
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  ¥{(Number(request.totalAmount ?? 0) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {request.status !== 'pending' && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
                <Clock size={18} className="mr-2 text-primary-500" />
                审批信息
              </h3>
              {request.approverName && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-500">审批人</span>
                  <span className="text-sm font-medium text-neutral-700">
                    {request.approverName}
                  </span>
                </div>
              )}
              {request.approvedAt && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-500">审批时间</span>
                  <span className="text-sm font-medium text-neutral-700">
                    {formatDate(new Date(request.approvedAt), 'YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              )}
              {request.rejectReason && (
                <div className="mt-3 p-3 bg-danger-50 rounded-lg">
                  <p className="text-xs text-danger-600 font-medium mb-1">
                    驳回原因
                  </p>
                  <p className="text-sm text-danger-700">
                    {request.rejectReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {request.status === 'pending' && canApprove && (
          <div className="space-y-3">
            <Button
              size="full"
              variant="success"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              <CheckCircle2 size={18} className="mr-2" />
              同意领用
            </Button>
            <Button
              size="full"
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
            >
              <XCircle size={18} className="mr-2" />
              驳回申请
            </Button>
          </div>
        )}

        {request.status === 'approved' && canApprove && (
          <Button
            size="full"
            variant="primary"
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            <CheckCircle2 size={18} className="mr-2" />
            确认出库完成
          </Button>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-danger-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-700">驳回申请</h3>
              <p className="text-sm text-neutral-500 mt-2">
                请输入驳回原因
              </p>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入驳回原因..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="flex space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                className="flex-1"
                disabled={!rejectReason.trim()}
              >
                确认驳回
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && <LoadingOverlay text="正在处理..." />}
    </div>
  );
};
