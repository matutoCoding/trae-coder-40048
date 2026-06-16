import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  Flashlight,
  FlashlightOff,
  X,
  Scan,
  AlertCircle,
  CheckCircle2,
  Factory,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/common/Card';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Button } from '../components/common/Button';
import { Empty } from '../components/common/Empty';
import { classNames, formatDate } from '../utils';

const SCAN_CONTAINER_ID = 'qr-reader';

export const ScanQR: React.FC = () => {
  const navigate = useNavigate();
  const { devices, inspectionPlans } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'auto' | 'manual'>('auto');
  const [manualDeviceNo, setManualDeviceNo] = useState('');
  const [scanHistory, setScanHistory] = useState<Array<{
    id: string;
    deviceId: string;
    deviceName: string;
    deviceNo: string;
    scanTime: string;
  }>>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScannerRunning.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setScanError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(SCAN_CONTAINER_ID);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
        }
      );

      isScannerRunning.current = true;
      setIsScanning(true);
    } catch (error) {
      console.error('Scanner error:', error);
      setScanError('无法启动相机，请检查相机权限');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScannerRunning.current) {
      try {
        await scannerRef.current.stop();
        isScannerRunning.current = false;
      } catch (error) {
        console.error('Stop scanner error:', error);
      }
    }
    setIsScanning(false);
  };

  const toggleFlash = () => {
    if (scannerRef.current && isScannerRunning.current) {
      scannerRef.current
        .applyVideoConstraints({
          advanced: [{ torch: !flashOn } as any],
        })
        .then(() => setFlashOn(!flashOn))
        .catch(() => {});
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setLastScanResult(decodedText);
    stopScanner();

    const device = devices.find(
      (d) => d.qrCode === decodedText || d.deviceNo === decodedText || d.id === decodedText
    );

    if (device) {
      const newHistoryItem = {
        id: `scan-${Date.now()}`,
        deviceId: device.id,
        deviceName: device.name,
        deviceNo: device.deviceNo,
        scanTime: new Date().toISOString(),
      };
      setScanHistory((prev) => [newHistoryItem, ...prev].slice(0, 10));

      setTimeout(() => {
        navigate(`/inspection/execute/${device.id}`);
      }, 500);
    } else {
      setScanError(`未找到设备：${decodedText}`);
    }
  };

  const handleManualInput = () => {
    if (!manualDeviceNo.trim()) {
      setScanError('请输入设备编号或二维码内容');
      return;
    }
    handleScanSuccess(manualDeviceNo.trim());
  };

  const resetScanner = () => {
    setLastScanResult(null);
    setScanError(null);
    setManualDeviceNo('');
  };

  const devicePendingPlans = (deviceId: string) => {
    return inspectionPlans.filter(
      (p) =>
        p.deviceId === deviceId &&
        (p.status === 'pending' || p.status === 'in_progress')
    ).length;
  };

  return (
    <div className="min-h-screen bg-neutral-900 pb-20">
      <Header title="扫码点检" dark />

      <div className="px-4 py-4 space-y-4">
        {!isScanning && !lastScanResult && (
          <div className="flex bg-neutral-800 rounded-lg p-1 mb-4">
            <button
              onClick={() => setScanMode('auto')}
              className={classNames(
                'flex-1 py-2 rounded-md text-sm font-medium transition-all',
                scanMode === 'auto'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-400'
              )}
            >
              <Camera size={14} className="inline mr-1" />
              扫码
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={classNames(
                'flex-1 py-2 rounded-md text-sm font-medium transition-all',
                scanMode === 'manual'
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-400'
              )}
            >
              <QrCode size={14} className="inline mr-1" />
              手动输入
            </button>
          </div>
        )}

        {scanMode === 'auto' && (
          <>
            <div className="relative bg-neutral-900 rounded-2xl overflow-hidden aspect-square max-w-sm mx-auto">
              <div
                id={SCAN_CONTAINER_ID}
                className="w-full h-full"
                style={{ minHeight: '300px' }}
              />

              {isScanning && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl" />
                      <div className="absolute inset-0 animate-scan-line">
                        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <button
                      onClick={toggleFlash}
                      className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    >
                      {flashOn ? <Flashlight size={20} /> : <FlashlightOff size={20} />}
                    </button>
                    <button
                      onClick={stopScanner}
                      className="w-12 h-12 bg-danger-500/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </>
              )}

              {!isScanning && !lastScanResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-800">
                  <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
                    <Scan size={40} className="text-primary-500" />
                  </div>
                  <p className="text-white/70 text-sm mb-4">扫描设备二维码开始点检</p>
                  <Button variant="primary" onClick={startScanner}>
                    开始扫码
                  </Button>
                </div>
              )}
            </div>

            {scanError && (
              <div className="bg-danger-500/20 border border-danger-500/30 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-danger-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-danger-400 font-medium">{scanError}</p>
                    <p className="text-danger-300/70 text-sm mt-1">
                      请检查二维码是否正确，或使用手动输入方式
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetScanner}
                    className="flex-1 border-danger-500/30 text-danger-400"
                  >
                    重试
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setScanMode('manual')}
                    className="flex-1"
                  >
                    手动输入
                  </Button>
                </div>
              </div>
            )}

            {lastScanResult && (
              <div className="bg-success-500/20 border border-success-500/30 rounded-xl p-4">
                <div className="flex items-center">
                  <CheckCircle2 size={20} className="text-success-500 mr-3" />
                  <div>
                    <p className="text-success-400 font-medium">扫描成功</p>
                    <p className="text-success-300/70 text-sm">{lastScanResult}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {scanMode === 'manual' && !lastScanResult && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode size={32} className="text-primary-500" />
                </div>
                <h3 className="font-bold text-neutral-700">手动输入设备编号</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  如果无法扫码，请手动输入设备编号或二维码内容
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={manualDeviceNo}
                    onChange={(e) => setManualDeviceNo(e.target.value)}
                    placeholder="请输入设备编号，如：SKT-001"
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>

                {scanError && (
                  <p className="text-sm text-danger-500">{scanError}</p>
                )}

                <Button size="full" onClick={handleManualInput}>
                  确认并开始点检
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
              <Factory size={18} className="mr-2 text-primary-500" />
              待点检设备
            </h3>
            <div className="space-y-2">
              {devices.slice(0, 5).map((device) => {
                const pendingCount = devicePendingPlans(device.id);
                if (pendingCount === 0) return null;
                return (
                  <div
                    key={device.id}
                    onClick={() => navigate(`/inspection/execute/${device.id}`)}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl cursor-pointer active:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <Factory size={18} className="text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700 text-sm">
                          {device.name}
                        </p>
                        <p className="text-xs text-neutral-500">{device.deviceNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full mr-2">
                        {pendingCount} 项
                      </span>
                      <ChevronRight size={16} className="text-neutral-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {scanHistory.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-neutral-700 mb-4 flex items-center">
                <Scan size={18} className="mr-2 text-success-500" />
                最近扫描记录
              </h3>
              <div className="space-y-2">
                {scanHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                        <CheckCircle2 size={16} className="text-success-500" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700 text-sm">
                          {item.deviceName}
                        </p>
                        <p className="text-xs text-neutral-500">{item.deviceNo}</p>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {formatDate(new Date(item.scanTime), 'HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-neutral-800/50 rounded-xl p-4">
          <h4 className="text-white/70 text-sm font-medium mb-2">扫码说明</h4>
          <ul className="text-white/50 text-xs space-y-1">
            <li>• 将设备二维码置于扫描框内，系统自动识别</li>
            <li>• 请确保设备二维码清晰、光线充足</li>
            <li>• 如无法扫码，可使用手动输入功能</li>
            <li>• 扫描成功后将自动进入点检界面</li>
          </ul>
        </div>
      </div>

      <BottomNav active="scan" />
    </div>
  );
};
