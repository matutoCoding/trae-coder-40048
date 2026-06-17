import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Factory,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Send,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  Package,
  MapPin,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { Input, ImageUpload, Slider } from '../components/common/Form';
import { Empty, LoadingOverlay } from '../components/common/Empty';
import { classNames, formatDate, safeNumber, formatPrice } from '../utils';
import type { MaintenanceItemResult, SparePartUsage, MaintenanceTask } from '../types';

export const MaintenanceOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    maintenanceOrders,
    devices,
    spareParts,
    user,
    updateMaintenanceOrder,
    updateDeviceStatus,
  } = useAppStore();

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [itemResults, setItemResults] = useState<Map<string, MaintenanceItemResult>>(new Map());
  const [remark, setRemark] = useState('');
  const [laborHours, setLaborHours] = useState(0);
  const [sparePartUsages, setSparePartUsages] = useState<SparePartUsage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSparePartSelect, setShowSparePartSelect] = useState(false);

  const order = useMemo(
    () => maintenanceOrders.find((o) => o.id === id),
    [maintenanceOrders, id]
  );
  const device = useMemo(
    () => devices.find((d) => d.id === order?.deviceId),
    [devices, order]
  );
  const orderItems = useMemo(
    () => order?.items || order?.tasks || [],
    [order]
  );

  const progress = useMemo(() => {
    if (orderItems.length === 0) return 0;
    let completedCount = 0;
    if (itemResults.size > 0) {
      completedCount = Array.from(itemResults.values()).filter(
        (v) => v.status !== 'pending'
      ).length;
    } else if (order?.results && order.results.length > 0) {
      completedCount = order.results.filter(
        (r) => r.status !== 'pending'
      ).length;
    } else if (order?.completedItems !== undefined) {
      completedCount = order.completedItems;
    } else {
      completedCount = orderItems.filter(
        (item: any) => item.status && item.status !== 'pending'
      ).length;
    }
    return (completedCount / orderItems.length) * 100;
  }, [order, orderItems, itemResults]);

  const completionStats = useMemo(() => {
    let completed = 0;
    let skipped = 0;
    let replaced = 0;

    if (itemResults.size > 0) {
      const values = Array.from(itemResults.values());
      completed = values.filter((v) => v.status === 'completed').length;
      skipped = values.filter((v) => v.status === 'skipped').length;
      replaced = values.filter((v) => v.status === 'replaced').length;
    } else if (order?.results && order.results.length > 0) {
      completed = order.results.filter((r) => r.status === 'completed').length;
      skipped = order.results.filter((r) => r.status === 'skipped').length;
      replaced = order.results.filter((r) => r.status === 'replaced').length;
    } else if (orderItems.length > 0) {
      completed = orderItems.filter((item: any) => item.status === 'completed').length;
      skipped = orderItems.filter((item: any) => item.status === 'skipped').length;
      replaced = orderItems.filter((item: any) => item.status === 'replaced').length;
    }

    return {
      completed,
      skipped,
      replaced,
      total: orderItems.length,
    };
  }, [itemResults, order, orderItems]);

  const sparePartsCost = useMemo(() => {
    if (!order) return 0;
    if (order.spareParts && order.spareParts.length > 0) {
      return order.spareParts.reduce((sum, item) => {
        const price = safeNumber(item.unitPrice, 0);
        const qty = safeNumber(item.quantity, 0);
        return sum + price * qty;
      }, 0);
    }
    if (order.materials && order.materials.length > 0) {
      return order.materials.reduce((sum, item) => {
        const part = spareParts.find((p) => p.id === item.sparePartId);
        const price = part ? safeNumber(part.price, 0) : 0;
        const qty = safeNumber(item.quantity, 0);
        return sum + price * qty;
      }, 0);
    }
    return 0;
  }, [order, spareParts]);

  const laborCost = useMemo(() => {
    const hours = order?.laborHours !== undefined ? safeNumber(order.laborHours, 0) : laborHours;
    return hours * 80;
  }, [order?.laborHours, laborHours]);

  const totalCost = useMemo(() => {
    if (order?.totalCost !== undefined) {
      return safeNumber(order.totalCost, 0);
    }
    return sparePartsCost + laborCost;
  }, [order?.totalCost, sparePartsCost, laborCost]);

  const currentItem = orderItems[currentItemIndex];

  const handleItemResultChange = (itemId: string, result: Partial<MaintenanceItemResult>) => {
    setItemResults((prev) => {
      const next = new Map(prev);
      const existing = next.get(itemId) || {
        itemId,
        status: 'pending',
        value: '',
        remark: '',
        images: [],
      };
      next.set(itemId, { ...existing, ...result });
      return next;
    });
  };

  const handleItemStatusChange = (status: 'completed' | 'skipped' | 'replaced') => {
    if (!currentItem) return;
    handleItemResultChange(currentItem.id, { status });
  };

  const handleAddSparePart = (part: { id: string; name: string; partCode?: string; specification?: string; unit: string; price?: number }) => {
    setSparePartUsages((prev) => [
      ...prev,
      {
        partId: part.id,
        partName: part.name,
        partCode: part.partCode,
        specification: part.specification,
        quantity: 1,
        unit: part.unit,
        unitPrice: part.price,
      },
    ]);
    setShowSparePartSelect(false);
  };

  const handleUpdateSparePartQuantity = (index: number, quantity: number) => {
    if (quantity < 0) return;
    setSparePartUsages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const handleRemoveSparePart = (index: number) => {
    setSparePartUsages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (!order) return;
    updateMaintenanceOrder(order.id, {
      status: 'in_progress',
      actualStartDate: new Date().toISOString(),
    });
  };

  const handleSubmit = async () => {
    if (!order || !device || !user) return;

    setIsSubmitting(true);

    try {
      const results = Array.from(itemResults.values());
      const sparePartsTotal = sparePartUsages.reduce(
        (sum, item) => sum + safeNumber(item.unitPrice, 0) * safeNumber(item.quantity, 0),
        0
      );
      const laborTotal = safeNumber(laborHours, 0) * 80;
      const calculatedTotalCost = sparePartsTotal + laborTotal;

      await updateMaintenanceOrder(order.id, {
        status: 'completed',
        actualEndDate: new Date().toISOString(),
        completedItems: results.filter((r) => r.status === 'completed').length,
        results,
        spareParts: sparePartUsages,
        laborHours: safeNumber(laborHours, 0),
        totalCost: calculatedTotalCost,
        remark,
      });

      await updateDeviceStatus(device.id, 'running');

      setTimeout(() => {
        navigate('/maintenance-orders');
      }, 500);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="工单不存在" description="该保养工单可能已被删除" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Empty title="设备不存在" description="关联设备可能已被删除" />
      </div>
    );
  }

  const isMine = order.assigneeId === user?.id;
  const canEdit =
    isMine && (order.status === 'pending' || order.status === 'in_progress');

  const getTypeColor = (type: string) => {
    switch (type) {
      case '日常':
        return 'bg-primary-100 text-primary-600';
      case '定期':
        return 'bg-success-100 text-success-600';
      case '换季':
        return 'bg-warning-100 text-warning-600';
      case '专项':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="保养工单详情" />

      <div className="px-4 py-4 space-y-4">
        <div
          className={classNames(
            'rounded-2xl p-5 text-white shadow-lg',
            order.status === 'completed'
              ? 'bg-gradient-to-r from-success-500 to-success-600'
              : order.status === 'in_progress'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600'
              : order.status === 'pending'
              ? 'bg-gradient-to-r from-warning-500 to-warning-600'
              : 'bg-gradient-to-r from-neutral-500 to-neutral-600'
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Wrench size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{order.orderNo}</h1>
                <p className="text-white/80 text-sm mt-0.5">
                  {order.maintenanceType}保养
                </p>
              </div>
            </div>
            <StatusBadge status={order.status} variant="light" />
          </div>
          <p className="text-white/90">{order.description}</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Factory size={18} className="mr-2 text-primary-500" />
              设备信息
            </h3>
            <div
              onClick={() => navigate(`/devices/${device.id}`)}
              className="flex items-center p-3 bg-neutral-50 rounded-xl cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                <Factory size={20} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-700">{device.name}</p>
                <p className="text-xs text-neutral-500">
                  {device.deviceNo} · {device.model}
                </p>
                <p className="text-xs text-neutral-400 mt-1 flex items-center">
                  <MapPin size={10} className="mr-1" />
                  {device.location}
                </p>
              </div>
              <ArrowRight size={16} className="text-neutral-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <FileText size={18} className="mr-2 text-primary-500" />
              基本信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500 flex items-center">
                  <User size={14} className="mr-2" />
                  负责人
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {order.assigneeName}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500 flex items-center">
                  <Calendar size={14} className="mr-2" />
                  计划时间
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {formatDate(new Date(order.scheduledDate), 'YYYY-MM-DD HH:mm')}
                </span>
              </div>
              {order.actualStartDate && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Clock size={14} className="mr-2" />
                    开始时间
                  </span>
                  <span className="text-sm font-medium text-neutral-700">
                    {formatDate(new Date(order.actualStartDate), 'YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              )}
              {order.actualEndDate && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <CheckCircle2 size={14} className="mr-2" />
                    完成时间
                  </span>
                  <span className="text-sm font-medium text-neutral-700">
                    {formatDate(new Date(order.actualEndDate), 'YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-sm text-neutral-500 flex items-center">
                  <Calendar size={14} className="mr-2" />
                  创建时间
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {formatDate(new Date(order.createdAt), 'YYYY-MM-DD HH:mm')}
                </span>
              </div>
              {totalCost > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Package size={14} className="mr-2" />
                    费用总计
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ¥{formatPrice(totalCost)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {order.status === 'pending' && canEdit && (
          <Button size="full" variant="primary" onClick={handleStart}>
            <Play size={18} className="mr-2" />
            开始保养
          </Button>
        )}

        {canEdit && order.status === 'in_progress' && currentItem && (
          <div className="animate-fade-in">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-neutral-700">保养项执行</h3>
                  <span className="text-sm text-neutral-500">
                    {currentItemIndex + 1}/{orderItems.length}
                  </span>
                </div>

                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div
                  key={currentItem.id}
                  className="bg-neutral-50 rounded-xl p-4 mb-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className={classNames(
                          'text-xs px-2 py-0.5 rounded-full',
                          getTypeColor(currentItem.category)
                        )}
                      >
                        {currentItem.category}
                      </span>
                      <h4 className="font-bold text-neutral-700 mt-2">
                        {currentItem.name}
                      </h4>
                      <p className="text-sm text-neutral-500 mt-1">
                        {currentItem.description}
                      </p>
                    </div>
                    {itemResults.get(currentItem.id) && (
                      <CheckCircle2 size={20} className="text-success-500" />
                    )}
                  </div>

                  {currentItem.dataType === 'percentage' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {currentItem.name}
                      </label>
                      <div className="text-center mb-2">
                        <span className="text-3xl font-bold text-primary-500">
                          {itemResults.get(currentItem.id)?.value || '0'}%
                        </span>
                      </div>
                      <Slider
                        value={parseFloat(String(itemResults.get(currentItem.id)?.value || '0')) || 0}
                        onChange={(v) =>
                          handleItemResultChange(currentItem.id, {
                            value: String(v),
                            status: 'completed',
                          })
                        }
                        min={0}
                        max={100}
                        unit="%"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      保养结果
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleItemStatusChange('completed')}
                        className={classNames(
                          'py-2 rounded-lg text-xs font-medium transition-all',
                          itemResults.get(currentItem.id)?.status === 'completed'
                            ? 'bg-success-500 text-white'
                            : 'bg-success-50 text-success-600'
                        )}
                      >
                        <CheckCircle2 size={14} className="inline mr-1" />
                        完成
                      </button>
                      <button
                        onClick={() => handleItemStatusChange('replaced')}
                        className={classNames(
                          'py-2 rounded-lg text-xs font-medium transition-all',
                          itemResults.get(currentItem.id)?.status === 'replaced'
                            ? 'bg-primary-500 text-white'
                            : 'bg-primary-50 text-primary-600'
                        )}
                      >
                        <Package size={14} className="inline mr-1" />
                        更换
                      </button>
                      <button
                        onClick={() => handleItemStatusChange('skipped')}
                        className={classNames(
                          'py-2 rounded-lg text-xs font-medium transition-all',
                          itemResults.get(currentItem.id)?.status === 'skipped'
                            ? 'bg-warning-500 text-white'
                            : 'bg-warning-50 text-warning-600'
                        )}
                      >
                        <AlertTriangle size={14} className="inline mr-1" />
                        跳过
                      </button>
                    </div>
                  </div>

                  {currentItem.requireImage && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <Camera size={14} className="inline mr-1" />
                        现场照片
                      </label>
                      <ImageUpload
                        value={itemResults.get(currentItem.id)?.images || []}
                        onChange={(images) =>
                          handleItemResultChange(currentItem.id, { images })
                        }
                        maxCount={5}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      备注说明
                    </label>
                    <Input
                      type="textarea"
                      value={itemResults.get(currentItem.id)?.remark || ''}
                      onChange={(v) =>
                        handleItemResultChange(currentItem.id, { remark: v })
                      }
                      placeholder="请输入备注说明（选填）"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={currentItemIndex === 0}
                    onClick={() =>
                      setCurrentItemIndex((i) => Math.max(0, i - 1))
                    }
                    className="flex-1 mr-2"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    上一项
                  </Button>
                  {currentItemIndex < orderItems.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={() =>
                        setCurrentItemIndex((i) =>
                          Math.min(orderItems.length - 1, i + 1)
                        )
                      }
                      className="flex-1 ml-2"
                    >
                      下一项
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={() => setShowConfirm(true)}
                      className="flex-1 ml-2"
                    >
                      <Send size={16} className="mr-1" />
                      完成保养
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-neutral-700 mb-3">保养项导航</h4>
                <div className="grid grid-cols-6 gap-2">
                  {orderItems.map((item, index) => {
                    const result = itemResults.get(item.id);
                    const isActive = index === currentItemIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentItemIndex(index)}
                        className={classNames(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary-500 text-white'
                            : result
                            ? result.status === 'completed'
                              ? 'bg-success-100 text-success-600'
                              : result.status === 'replaced'
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-warning-100 text-warning-600'
                            : 'bg-neutral-100 text-neutral-400'
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-neutral-700 flex items-center">
                    <Package size={18} className="mr-2 text-primary-500" />
                    备件使用
                  </h4>
                  <button
                    onClick={() => setShowSparePartSelect(true)}
                    className="text-sm text-primary-500 font-medium"
                  >
                    + 添加
                  </button>
                </div>
                {sparePartUsages.length > 0 ? (
                  <div className="space-y-2">
                    {sparePartUsages.map((usage, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-700 text-sm truncate">
                            {usage.partName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {usage.partCode} · {usage.specification}
                          </p>
                        </div>
                        <div className="flex items-center ml-3">
                          <button
                            onClick={() =>
                              handleUpdateSparePartQuantity(
                                index,
                                usage.quantity - 1
                              )
                            }
                            className="w-7 h-7 bg-neutral-200 rounded flex items-center justify-center text-neutral-600"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {usage.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateSparePartQuantity(
                                index,
                                usage.quantity + 1
                              )
                            }
                            className="w-7 h-7 bg-primary-100 rounded flex items-center justify-center text-primary-600"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveSparePart(index)}
                            className="ml-2 text-danger-500"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-neutral-400 text-sm">
                    暂无使用备件
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-neutral-700 mb-3">工时统计</h4>
                <div className="text-center mb-3">
                  <span className="text-3xl font-bold text-primary-500">
                    {laborHours}
                  </span>
                  <span className="text-neutral-500 ml-1">小时</span>
                </div>
                <Slider
                  value={laborHours}
                  onChange={setLaborHours}
                  min={0}
                  max={8}
                  step={0.5}
                  unit="h"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-neutral-700 mb-3">总体备注</h4>
                <Input
                  type="textarea"
                  value={remark}
                  onChange={setRemark}
                  placeholder="请输入本次保养的总体备注（选填）"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {order.status === 'completed' && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-4">保养结果</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success-500">
                    {completionStats.completed}
                  </p>
                  <p className="text-xs text-neutral-500">完成</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-500">
                    {completionStats.replaced}
                  </p>
                  <p className="text-xs text-neutral-500">更换</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning-500">
                    {completionStats.skipped}
                  </p>
                  <p className="text-xs text-neutral-500">跳过</p>
                </div>
              </div>

              <div className="space-y-2">
                {order.results && order.results.length > 0 ? (
                  order.results.map((result, index) => {
                    const item = orderItems.find((i) => i.id === result.itemId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {result.status === 'completed' ? (
                            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                              <CheckCircle2 size={16} className="text-success-500" />
                            </div>
                          ) : result.status === 'replaced' ? (
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                              <Package size={16} className="text-primary-500" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-3">
                              <AlertTriangle size={16} className="text-warning-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-700 text-sm truncate">
                              {item?.name || result.name || '未知项'}
                            </p>
                            {result.value && (
                              <p className="text-xs text-neutral-500">
                                值：{result.value}
                              </p>
                            )}
                            {result.remark && (
                              <p className="text-xs text-neutral-400 mt-0.5 truncate">
                                备注：{result.remark}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : orderItems.length > 0 ? (
                  orderItems.map((item, index) => {
                    const status = (item as any).status || 'pending';
                    return (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {status === 'completed' ? (
                            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                              <CheckCircle2 size={16} className="text-success-500" />
                            </div>
                          ) : status === 'replaced' ? (
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                              <Package size={16} className="text-primary-500" />
                            </div>
                          ) : status === 'skipped' ? (
                            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-3">
                              <AlertTriangle size={16} className="text-warning-500" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-3">
                              <Clock size={16} className="text-neutral-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-700 text-sm truncate">
                              {item.name || '未知项'}
                            </p>
                            {(item as any).description && (
                              <p className="text-xs text-neutral-500 truncate">
                                {(item as any).description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-neutral-400 text-sm">
                    暂无保养结果
                  </div>
                )}
              </div>

              {(order.spareParts && order.spareParts.length > 0) || (order.materials && order.materials.length > 0) ? (
                <>
                  <h4 className="font-medium text-neutral-700 mt-4 mb-3">使用备件</h4>
                  <div className="space-y-2">
                    {order.spareParts && order.spareParts.length > 0
                      ? order.spareParts.map((part, index) => {
                          const price = safeNumber(part.unitPrice, 0);
                          const qty = safeNumber(part.quantity, 0);
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-neutral-700 text-sm">
                                  {part.partName || part.name || '未知备件'}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {part.partCode || ''} {part.specification ? `· ${part.specification}` : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-neutral-700">
                                  {qty} {part.unit || ''}
                                </p>
                                {price > 0 && (
                                  <p className="text-xs text-primary-500">
                                    ¥{formatPrice(price * qty)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      : order.materials?.map((material, index) => {
                          const part = spareParts.find((p) => p.id === material.sparePartId);
                          const price = part ? safeNumber(part.price, 0) : 0;
                          const qty = safeNumber(material.quantity, 0);
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-neutral-700 text-sm">
                                  {material.name || part?.name || '未知备件'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-neutral-700">
                                  {qty} {material.unit || ''}
                                </p>
                                {price > 0 && (
                                  <p className="text-xs text-primary-500">
                                    ¥{formatPrice(price * qty)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </>
              ) : null}

              {order.laborHours !== undefined && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-100">
                  <span className="text-sm text-neutral-500">工时</span>
                  <span className="text-sm font-medium text-neutral-700">
                    {safeNumber(order.laborHours, 0)} 小时 (¥{formatPrice(safeNumber(order.laborHours, 0) * 80)})
                  </span>
                </div>
              )}

              {totalCost > 0 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-100">
                  <span className="text-sm text-neutral-500">费用合计</span>
                  <span className="text-lg font-bold text-primary-600">
                    ¥{formatPrice(totalCost)}
                  </span>
                </div>
              )}

              {order.remark && (
                <div className="mt-4 p-3 bg-neutral-50 rounded-xl">
                  <p className="text-xs text-neutral-400 mb-1">备注</p>
                  <p className="text-sm text-neutral-600">{order.remark}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} className="text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-700">确认完成保养</h3>
              <p className="text-sm text-neutral-500 mt-2">
                请确认保养结果是否完整准确
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-success-500">
                    {completionStats.completed}
                  </p>
                  <p className="text-xs text-neutral-500">完成</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-500">
                    {completionStats.replaced}
                  </p>
                  <p className="text-xs text-neutral-500">更换</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning-500">
                    {completionStats.skipped}
                  </p>
                  <p className="text-xs text-neutral-500">跳过</p>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">预计费用</span>
                <span className="text-xl font-bold text-primary-600">
                  ¥{formatPrice(
                    sparePartUsages.reduce(
                      (sum, item) => sum + safeNumber(item.unitPrice, 0) * safeNumber(item.quantity, 0),
                      0
                    ) + safeNumber(laborHours, 0) * 80
                  )}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button variant="primary" onClick={handleSubmit} className="flex-1">
                确认提交
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSparePartSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-700">选择备件</h3>
              <button
                onClick={() => setShowSparePartSelect(false)}
                className="text-neutral-400"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {spareParts.map((part) => (
                  <div
                    key={part.id}
                    onClick={() => handleAddSparePart(part)}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl cursor-pointer active:bg-neutral-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-700">{part.name}</p>
                      <p className="text-xs text-neutral-500">
                        {part.partCode} · {part.specification}
                      </p>
                      <p className="text-xs text-primary-500 mt-0.5">
                        库存：{part.stock} {part.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-700">
                        ¥{formatPrice(part.price)}
                      </p>
                      <p className="text-xs text-neutral-400">/{part.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && <LoadingOverlay text="正在提交..." />}
    </div>
  );
};
