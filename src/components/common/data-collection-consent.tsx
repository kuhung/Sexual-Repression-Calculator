/**
 * 数据采集同意组件 - 让用户选择是否参与匿名数据采集
 * 遵循GDPR和隐私保护最佳实践
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Lock, 
  Info,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { 
  configureScoreCollection, 
  setDataCollectionConsent, 
  getCollectionStatus,
  exportCollectedData 
} from '@/lib/analytics';

interface DataCollectionConsentProps {
  onConsentChange?: (consent: boolean) => void;
  className?: string;
}

export function DataCollectionConsent({ onConsentChange, className }: DataCollectionConsentProps) {
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState(getCollectionStatus());

  useEffect(() => {
    // 读取已保存的同意状态
    const savedConsent = localStorage.getItem('sri_data_collection_consent');
    if (savedConsent !== null) {
      const consentBool = savedConsent === 'true';
      setConsent(consentBool);
      configureScoreCollection({ enabled: consentBool });
    }
  }, []);

  const handleConsentChange = (newConsent: boolean) => {
    setConsent(newConsent);
    setDataCollectionConsent(newConsent);
    configureScoreCollection({ enabled: newConsent });
    setStatus(getCollectionStatus());
    onConsentChange?.(newConsent);
  };

  return (
    <Card className={`border-2 ${consent ? 'border-green-200 bg-green-50/30' : 'border-gray-200'} ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-psychology-primary" />
          数据采集设置
          <Badge variant={consent ? "default" : "secondary"} className="ml-2">
            {consent ? '已同意' : '未同意'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 主要开关 */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex-1">
            <h4 className="font-medium mb-1">参与匿名数据采集</h4>
            <p className="text-sm text-muted-foreground">
              帮助改进SRI评估系统，您的数据将完全匿名化处理
            </p>
          </div>
          <Switch
            checked={consent}
            onCheckedChange={handleConsentChange}
            className="ml-4"
          />
        </div>

        {/* 详细说明 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h5 className="font-medium text-blue-800 mb-1">我们采集什么数据？</h5>
              <ul className="text-blue-700 space-y-1">
                <li>• SRI总分和四维度分数</li>
                <li>• 匿名化的人口学信息（年龄段、性别等）</li>
                <li>• 评估类型和完成时间</li>
                <li>• 基本的技术信息（浏览器类型、屏幕分辨率）</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h5 className="font-medium text-green-800 mb-1">隐私保护措施</h5>
              <ul className="text-green-700 space-y-1">
                <li>• 所有数据完全匿名化，无法追溯到个人</li>
                <li>• 不采集任何个人身份信息</li>
                <li>• 数据仅用于科学研究和系统改进</li>
                <li>• 您可以随时撤回同意</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h5 className="font-medium text-purple-800 mb-1">数据用途</h5>
              <ul className="text-purple-700 space-y-1">
                <li>• 建立更准确的常模数据</li>
                <li>• 优化评估算法和题目</li>
                <li>• 发布匿名化的研究报告</li>
                <li>• 改进用户体验</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 当前状态显示 */}
        {consent && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              采集状态
            </h5>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>队列中的数据点:</span>
                <span className="font-mono">{status.queueSize}</span>
              </div>
              <div className="flex justify-between">
                <span>提交状态:</span>
                <span className={status.isSubmitting ? 'text-blue-600' : 'text-green-600'}>
                  {status.isSubmitting ? '提交中...' : '就绪'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>采集已启用:</span>
                <span className="flex items-center gap-1">
                  {status.config.enabled ? (
                    <><CheckCircle className="w-3 h-3 text-green-600" /> 是</>
                  ) : (
                    <><XCircle className="w-3 h-3 text-red-600" /> 否</>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatus(getCollectionStatus())}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            刷新状态
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportCollectedData}
              className="flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              导出数据
            </Button>
          )}
        </div>

        {/* 法律声明 */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p>
            通过同意数据采集，您确认已阅读并理解我们的数据处理方式。
            您的参与是完全自愿的，可以随时在设置中撤回同意。
            所有数据处理均符合相关隐私法规要求。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 简化版的数据采集同意组件（用于嵌入其他页面）
 */
export function DataCollectionConsentCompact({ onConsentChange, className }: DataCollectionConsentProps) {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem('sri_data_collection_consent');
    if (savedConsent !== null) {
      setConsent(savedConsent === 'true');
    }
  }, []);

  const handleConsentChange = (newConsent: boolean) => {
    setConsent(newConsent);
    setDataCollectionConsent(newConsent);
    configureScoreCollection({ enabled: newConsent });
    onConsentChange?.(newConsent);
  };

  return (
    <div className={`p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-800">帮助改进SRI系统</h4>
            <Switch
              checked={consent}
              onCheckedChange={handleConsentChange}
              size="sm"
            />
          </div>
          <p className="text-sm text-blue-700 leading-relaxed">
            您可以选择匿名分享您的评估结果数据，帮助我们建立更准确的常模和改进评估算法。
            所有数据将完全匿名化处理，不会包含任何个人身份信息。
          </p>
        </div>
      </div>
    </div>
  );
}
