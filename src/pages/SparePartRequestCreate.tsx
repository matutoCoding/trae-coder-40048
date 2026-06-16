import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  X,
  Send,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { Input, Select, RadioGroup } from '../components/common/Form';
import { LoadingOverlay, Empty } from '../components/common/Empty';
import { classNames, generateId, formatDate } from '../utils';
import type { SparePartUsage } from '../types';

const purposeOptions = [
  { label: '日常保养', value: '日常保养' },
  { label: '设备维修', value: '设备维修' },
  { label: '定期维护', value: '定期维护' },
  { label: '技术改造', value: '技术改造' },
  { label: '其他', value: '其他' },
];

export const SparePartRequestCreate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { spareParts, devices, user, createSparePartRequest, updateSparePartStock } =
    useAppStore();

  const preSelectedPartId = (location.state as any)?.partId;

  const [formData, setFormData] = useState({
    purpose: '设备维修',
    purposeDetail: '',
    deviceId: '',
    items: [] as SparePartUsage[],
  });
  const [showPartSelect, setShowPartSelect] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableParts = useMemo(() => {
    const selectedPartIds = formData.items.map((item) => item.partId);
    return spareParts.filter(
      (p) => !selectedPartIds.includes(p.id) && p.stock > 0
    );
  }, [spareParts, formData.items]);

  const deviceOptions = useMemo(
    () =>
      devices.map((d) => ({
        label: `${d.name} (${d.deviceNo})`,
        value: d.id,
      })),
    [devices]
  );

  const handleAddPart = (part: any) => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          partId: part.id,
          partName: part.name,
          partCode: part.partCode,
          specification: part.specification,
          quantity: 1,
          unit: part.unit,
          unitPrice: part.price,
        },
      ],
    }));
    setShowPartSelect(false);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 0) return;
    const part = spareParts.find(
      (p) => p.id === formData.items[index].partId
    );
    if (part && quantity > part.stock) {
      setErrors({ [`qty_${index}`]: `库存不足，最大 ${part.stock} ${part.unit}` });
      return;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`qty_${index}`];
      return newErrors;
    });
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity } : item
      ),
    }));
  };

  const handleRemovePart = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totalAmount = useMemo(() => {
    return formData.items
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      .toFixed(2);
  }, [formData.items]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.items.length === 0) {
      newErrors.items = '请至少选择一个备件';
    }

    formData.items.forEach((item, index) => {
      const part = spareParts.find((p) => p.id === item.partId);
      if (part && item.quantity > part.stock) {
        newErrors[`qty_${index}`] = `库存不足，最大 ${part.stock} ${part.unit}`;
      }
      if (item.quantity <= 0) {
        newErrors[`qty_${index}`] = '数量必须大于0';
      }
    });

    if (formData.purpose === '其他' && !formData.purposeDetail.trim()) {
      newErrors.purposeDetail = '请输入详细用途';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setIsSubmitting(true);

    try {
      formData.items.forEach((item) => {
        updateSparePartStock(item.partId, -item.quantity);
      });

      const requestId = createSparePartRequest({
        id: generateId('spr'),
        requestNo: `LY${formatDate(new Date(), 'YYYYMMDDHHmmss')}`,
        requesterId: user.id,
        requesterName: user.realName,
        requesterDepartment: user.department,
        purpose: formData.purpose,
        purposeDetail: formData.purposeDetail.trim(),
        deviceId: formData.deviceId || undefined,
        status: 'pending',
        items: formData.items,
        totalAmount: Number(totalAmount),
        createdAt: new Date().toISOString(),
      });

      setTimeout(() => {
        navigate(`/spare-parts/requests/${requestId}`);
      }, 500);
    } catch (error) {
      console.error('Create request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="备件领用申请" />

      <div className="px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-neutral-700 flex items-center">
              <User size={18} className="mr-2 text-primary-500" />
              申请人信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400">姓名</p>
                <p className="font-medium text-neutral-700">{user?.realName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">部门</p>
                <p className="font-medium text-neutral-700">
                  {user?.department}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">申请时间</p>
                <p className="font-medium text-neutral-700">
                  {formatDate(new Date(), 'YYYY-MM-DD HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">工号</p>
                <p className="font-medium text-neutral-700">{user?.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-neutral-700 flex items-center">
              <FileText size={18} className="mr-2 text-primary-500" />
              用途信息
            </h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                领用用途 <span className="text-danger-500">*</span>
              </label>
              <RadioGroup
                options={purposeOptions}
                value={formData.purpose}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, purpose: v }))
                }
              />
            </div>

            {formData.purpose === '其他' && (
              <Input
                label="详细用途"
                type="textarea"
                value={formData.purposeDetail}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, purposeDetail: v }))
                }
                placeholder="请输入详细用途..."
                rows={2}
                error={errors.purposeDetail}
                required
              />
            )}

            <Select
              label="使用设备"
              value={formData.deviceId}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, deviceId: v }))
              }
              options={deviceOptions}
              placeholder="请选择使用设备（选填）"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-700 flex items-center">
                <Package size={18} className="mr-2 text-primary-500" />
                备件清单
              </h3>
              <button
                onClick={() => setShowPartSelect(true)}
                className="text-sm text-primary-500 font-medium flex items-center"
              >
                <Plus size={16} className="mr-1" />
                添加
              </button>
            </div>

            {errors.items && (
              <div className="p-3 bg-danger-50 rounded-lg flex items-start">
                <AlertTriangle
                  size={16}
                  className="text-danger-500 mr-2 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-danger-600">{errors.items}</p>
              </div>
            )}

            {formData.items.length === 0 ? (
              <Empty
                title="暂无备件"
                description="点击右上角添加按钮选择备件"
                icon={<Package />}
              />
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => {
                  const part = spareParts.find((p) => p.id === item.partId);
                  return (
                    <div
                      key={item.partId}
                      className="animate-fade-in bg-neutral-50 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-700 text-sm">
                            {item.partName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.partCode} · {item.specification}
                          </p>
                          <p className="text-xs text-primary-500 mt-0.5">
                            ¥{item.unitPrice.toFixed(2)}/{item.unit}
                            {part && (
                              <span className="text-neutral-400 ml-2">
                                (库存: {part.stock} {item.unit})
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemovePart(index)}
                          className="text-neutral-400 hover:text-danger-500 ml-2"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-neutral-600 border border-neutral-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                index,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-14 h-8 text-center text-sm font-medium mx-2 bg-white rounded-lg border border-neutral-200"
                          />
                          <button
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-bold text-primary-600">
                          ¥{(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {errors[`qty_${index}`] && (
                        <p className="text-xs text-danger-500 mt-2">
                          {errors[`qty_${index}`]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {formData.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">合计金额</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ¥{totalAmount}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-neutral-400">
                    {formData.items.length} 项备件
                  </span>
                  <span className="text-xs text-neutral-400">
                    {formData.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}{' '}
                    件
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            size="full"
            variant="primary"
            onClick={() => setShowConfirm(true)}
            disabled={formData.items.length === 0}
          >
            <Send size={18} className="mr-2" />
            提交申请
          </Button>
          <Button size="full" variant="outline" onClick={() => navigate(-1)}>
            取消
          </Button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-700">确认提交</h3>
              <p className="text-sm text-neutral-500 mt-2">
                请确认领用信息是否正确
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">领用用途</span>
                <span className="text-sm font-medium text-neutral-700">
                  {formData.purpose}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">备件数量</span>
                <span className="text-sm font-medium text-neutral-700">
                  {formData.items.length} 项
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">总件数</span>
                <span className="text-sm font-medium text-neutral-700">
                  {formData.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}{' '}
                  件
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-700">
                    合计金额
                  </span>
                  <span className="text-xl font-bold text-primary-600">
                    ¥{totalAmount}
                  </span>
                </div>
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

      {showPartSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-700">选择备件</h3>
              <button
                onClick={() => setShowPartSelect(false)}
                className="text-neutral-400"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {availableParts.length === 0 ? (
                <Empty title="暂无可用备件" description="所有备件已添加或库存不足" />
              ) : (
                <div className="space-y-2">
                  {availableParts.map((part) => (
                    <div
                      key={part.id}
                      onClick={() => handleAddPart(part)}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl cursor-pointer active:bg-neutral-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-700">
                          {part.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {part.partCode} · {part.specification}
                        </p>
                        <p className="text-xs text-primary-500 mt-0.5">
                          库存：{part.stock} {part.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-700">
                          ¥{part.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-neutral-400">/{part.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isSubmitting && <LoadingOverlay text="正在提交..." />}
    </div>
  );
};
