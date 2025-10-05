/**
 * 设置页面 - 用户偏好设置和隐私控制
 * 包括数据采集设置、隐私选项等
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Home, 
  ArrowLeft,
  Shield,
  Trash2,
  Download,
  Info
} from 'lucide-react';
import { DataCollectionConsent } from '@/components/common';
import { 
  clearAllSessions, 
  exportAllSessionsData, 
  getStorageStats,
  secureDataWipe 
} from '@/lib/storage';
import { downloadAsJSON, downloadAsCSV } from '@/lib/storage';

export default function Settings() {
  const navigate = useNavigate();
  const [storageStats, setStorageStats] = React.useState(getStorageStats());

  // 刷新存储统计
  const refreshStats = () => {
    setStorageStats(getStorageStats());
  };

  // 清除所有数据
  const handleClearAllData = () => {
    if (window.confirm(
      '确定要清除所有评估历史吗？此操作不可撤销。\n\n' +
      '这将删除：\n' +
      '• 所有评估记录和结果\n' +
      '• 数据采集设置\n' +
      '• 其他本地存储的数据'
    )) {
      try {
        secureDataWipe();
        refreshStats();
        alert('所有数据已安全清除');
      } catch (error) {
        alert('清除数据时发生错误，请重试');
      }
    }
  };

  // 导出数据
  const handleExportData = () => {
    try {
      const data = exportAllSessionsData();
      if (data.length === 0) {
        alert('没有可导出的数据');
        return;
      }
      
      const filename = `SRI评估数据_${new Date().toISOString().split('T')[0]}`;
      
      // 提供JSON和CSV两种格式选择
      if (window.confirm('选择导出格式：\n确定 = JSON格式\n取消 = CSV格式')) {
        downloadAsJSON(data, `${filename}.json`);
      } else {
        downloadAsCSV(data, `${filename}.csv`);
      }
    } catch (error) {
      alert('导出数据时发生错误');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-psychology-calm via-white to-psychology-warm">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-muted">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-psychology-primary" />
                <span className="font-semibold text-psychology-primary">
                  设置
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              首页
            </Button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-psychology-primary mb-2">
            设置与隐私
          </h1>
          <p className="text-muted-foreground">
            管理您的偏好设置和隐私选项
          </p>
        </div>

        {/* 数据采集设置 */}
        <DataCollectionConsent />

        {/* 数据管理 */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-psychology-primary" />
              数据管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 存储统计 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">本地存储统计</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-psychology-primary">
                    {storageStats.totalSessions}
                  </div>
                  <div className="text-muted-foreground">总会话数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {storageStats.completedSessions}
                  </div>
                  <div className="text-muted-foreground">已完成</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {storageStats.quickTests}
                  </div>
                  <div className="text-muted-foreground">快测版</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {storageStats.fullTests}
                  </div>
                  <div className="text-muted-foreground">完整版</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                className="mt-3"
              >
                刷新统计
              </Button>
            </div>

            <Separator />

            {/* 数据操作 */}
            <div className="space-y-4">
              <h4 className="font-medium">数据操作</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 导出数据 */}
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h5 className="font-medium mb-1">导出数据</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        下载您的评估历史数据，支持JSON和CSV格式
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportData}
                        disabled={storageStats.completedSessions === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        导出数据
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* 清除数据 */}
                <Card className="p-4 border-red-200">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-red-600 mt-1" />
                    <div className="flex-1">
                      <h5 className="font-medium mb-1 text-red-800">清除所有数据</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        永久删除所有本地存储的数据，此操作不可撤销
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAllData}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        清除数据
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 隐私说明 */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-3 text-sm">
                <h4 className="font-semibold text-blue-800">隐私承诺</h4>
                
                <div className="space-y-2 text-blue-700">
                  <p className="leading-relaxed">
                    <strong>本地存储：</strong>您的所有评估数据都安全地保存在您的设备上，
                    我们无法访问您的个人评估结果。
                  </p>
                  
                  <p className="leading-relaxed">
                    <strong>数据采集：</strong>只有在您明确同意的情况下，我们才会采集
                    匿名化的统计数据用于科学研究。
                  </p>
                  
                  <p className="leading-relaxed">
                    <strong>数据安全：</strong>所有数据传输都经过加密保护，
                    我们遵循最高的数据安全标准。
                  </p>
                  
                  <p className="leading-relaxed">
                    <strong>用户控制：</strong>您拥有完全的数据控制权，
                    可以随时导出、删除或撤回数据采集同意。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 技术信息 */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">技术信息（开发模式）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono text-muted-foreground">
                <div>Node Environment: {process.env.NODE_ENV}</div>
                <div>Build Time: {new Date().toISOString()}</div>
                <div>User Agent: {navigator.userAgent}</div>
                <div>Screen: {screen.width}x{screen.height}</div>
                <div>Language: {navigator.language}</div>
                <div>Storage Available: {typeof(Storage) !== "undefined" ? 'Yes' : 'No'}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 返回按钮 */}
        <div className="flex justify-center pt-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
      </main>
    </div>
  );
}
