/**
 * 结果页面 - 显示SRI指数计算结果和详细分析
 * 提供专业的心理测评结果展示和个性化建议
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Home, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Info,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Lock,
  CalendarDays
} from 'lucide-react';
import { AssessmentSession, SRIResult, SRI_LEVELS } from '@/types';
import { getAssessmentSession, downloadAsJSON, diagnoseStorage } from '@/lib/storage';
import { ALL_SCALES } from '@/lib/scales';
import { ShareResult, ShareButtonMobile, SocialShareFloating, Footer, ReportUnlockPanel } from '@/components/common';
import { useIsMobile } from '@/hooks/use-mobile';
import { decodeShareData } from '@/lib/share-utils';
import { isReportUnlocked, markReportUnlocked } from '@/lib/report-unlock';

import { SEO } from '@/components/SEO';

const VERIFY_CHECKOUT_UNAVAILABLE_MESSAGE = '支付校验接口暂时不可用，请稍后刷新页面重试或联系支持。';

export default function Results() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // 支持多种参数名称以提高兼容性
  const sessionId = searchParams.get('sessionId') || searchParams.get('session') || searchParams.get('id');
  const isShared = searchParams.get('shared') === 'true'; // 检测是否为分享链接
  const shareData = searchParams.get('data'); // 分享数据
  const checkoutStatus = searchParams.get('checkout');
  const checkoutSessionId = searchParams.get('checkout_session_id');
  const isMobile = useIsMobile();
  
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullReportUnlocked, setIsFullReportUnlocked] = useState(false);
  const [unlockVerifying, setUnlockVerifying] = useState(false);
  const [unlockVerificationError, setUnlockVerificationError] = useState<string | null>(null);

  // 加载会话数据
  useEffect(() => {
    // 如果是分享链接，尝试从URL参数解码数据
    if (isShared && shareData) {
      try {
        const decoded = decodeShareData(shareData);
        if (decoded) {
          // 创建虚拟的session对象用于显示
          const virtualSession: AssessmentSession = {
            id: 'shared-session',
            type: decoded.type as 'quick' | 'full',
            demographics: {
              age: '',
              gender: '',
              relationshipStatus: '',
              sexualActivity: '',
              consentToParticipate: true
            },
            responses: [],
            results: {
              sessionId: 'shared-session',
              sri: {
                totalScore: decoded.sri.totalScore || 0,
                zScore: 0,
                percentile: 0,
                level: decoded.sri.level as keyof typeof SRI_LEVELS,
                dimensionScores: decoded.sri.dimensionScores || {
                  sosReversed: 0,
                  sexGuilt: 0,
                  sexualShame: 0,
                  sisOverSes: 0
                },
                scaleScores: []
              },
              interpretation: ['这是一个分享的评估结果。'],
              recommendations: ['如果您想获得个性化的详细分析，请开始您自己的评估。'],
              calculatedAt: new Date(decoded.completedAt)
            },
            startTime: new Date(decoded.completedAt),
            endTime: new Date(decoded.completedAt),
            completed: true
          };
          
          setSession(virtualSession);
          setLoading(false);
          return;
        } else {
          setError('分享链接数据无效');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error decoding share data:', err);
        setError('无法解析分享链接');
        setLoading(false);
        return;
      }
    }

    // 普通会话ID加载
    if (!sessionId) {
      console.log('URL parameters:', Object.fromEntries(searchParams.entries()));
      // 运行存储诊断
      const diagnosis = diagnoseStorage();
      console.log('Storage diagnosis:', diagnosis);
      setError('未找到评估会话ID。请确保从历史记录页面正确访问。');
      setLoading(false);
      return;
    }

    console.log('Loading session with ID:', sessionId);
    // 运行存储诊断
    const diagnosis = diagnoseStorage();
    console.log('Storage diagnosis:', diagnosis);

    try {
      const assessmentSession = getAssessmentSession(sessionId);
      console.log('Found session:', assessmentSession ? 'Yes' : 'No');
      
      if (!assessmentSession) {
        setError(`未找到会话ID为 "${sessionId}" 的评估记录。可能已被删除或损坏。`);
        setLoading(false);
        return;
      }

      if (!assessmentSession.results) {
        setError('该评估尚未完成，无法查看结果。请先完成评估。');
        setLoading(false);
        return;
      }

      console.log('Session loaded successfully');
      setSession(assessmentSession);
    } catch (err) {
      console.error('Error loading session:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`加载评估结果时发生错误: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId, isShared, shareData]);

  useEffect(() => {
    if (!session?.id || isShared) {
      setIsFullReportUnlocked(false);
      return;
    }

    setIsFullReportUnlocked(isReportUnlocked(session.id));
  }, [session?.id, isShared]);

  useEffect(() => {
    if (isShared || !sessionId) return;

    const clearCheckoutParams = () => {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete('checkout');
      nextParams.delete('checkout_session_id');
      setSearchParams(nextParams, { replace: true });
    };

    if (checkoutStatus === 'cancelled') {
      clearCheckoutParams();
      return;
    }

    if (checkoutStatus !== 'success' || !checkoutSessionId) return;

    let cancelled = false;

    async function verifyCheckout() {
      setUnlockVerifying(true);
      setUnlockVerificationError(null);

      try {
        const response = await fetch(
          `/api/verify-checkout-session?session_id=${encodeURIComponent(checkoutSessionId)}`,
        );
        const rawResponse = await response.text();
        let data: {
          unlocked?: boolean;
          error?: string;
          sessionId?: string;
          checkoutSessionId?: string;
          amountTotal?: number | null;
          currency?: string | null;
        } = {};

        try {
          data = rawResponse ? JSON.parse(rawResponse) : {};
        } catch {
          data = { error: VERIFY_CHECKOUT_UNAVAILABLE_MESSAGE };
        }

        if (!response.ok || !data.unlocked) {
          throw new Error(data.error || VERIFY_CHECKOUT_UNAVAILABLE_MESSAGE);
        }

        if (data.sessionId && data.sessionId !== sessionId) {
          throw new Error('支付记录与当前评估结果不匹配');
        }

        if (!cancelled) {
          markReportUnlocked(sessionId, {
            checkoutSessionId: data.checkoutSessionId,
            amountTotal: data.amountTotal,
            currency: data.currency,
          });
          setIsFullReportUnlocked(true);
          clearCheckoutParams();
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : VERIFY_CHECKOUT_UNAVAILABLE_MESSAGE;
          setUnlockVerificationError(message);
        }
      } finally {
        if (!cancelled) {
          setUnlockVerifying(false);
        }
      }
    }

    verifyCheckout();

    return () => {
      cancelled = true;
    };
  }, [checkoutSessionId, checkoutStatus, isShared, sessionId, setSearchParams]);

  // 下载结果
  const handleDownload = () => {
    if (!session || !sessionId) return;
    if (!isShared && !isFullReportUnlocked) {
      scrollToFullReportUnlock();
      return;
    }
    
    const exportData = {
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      type: session.type,
      demographics: session.demographics,
      results: session.results,
      responses: session.responses.reduce((acc, response) => {
        acc[response.questionId] = response.value;
        return acc;
      }, {} as Record<string, number>)
    };
    
    downloadAsJSON(exportData, `SRI评估结果_${new Date().toISOString().split('T')[0]}.json`);
  };

  // 重新测评
  const handleRetake = () => {
    navigate(`/assessment?type=${session?.type || 'quick'}`);
  };

  const scrollToFullReportUnlock = () => {
    document.getElementById('full-report-unlock')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  // 获取等级信息
  const getLevelInfo = (level: keyof typeof SRI_LEVELS) => {
    return SRI_LEVELS[level];
  };

  // 获取等级颜色类
  const getLevelColorClass = (level: keyof typeof SRI_LEVELS) => {
    const levelInfo = getLevelInfo(level);
    switch (level) {
      case 'very-low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very-high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-psychology-calm via-white to-psychology-warm flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-psychology-primary/10 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 text-psychology-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">加载结果中</h2>
              <p className="text-muted-foreground">正在获取您的评估结果...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !session || !session.results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-psychology-calm via-white to-psychology-warm flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">加载失败</h2>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {error || '未找到评估结果'}
              </p>
              
              {/* 调试信息（开发环境） */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-50 p-3 rounded-lg text-left text-xs text-gray-600 mb-4">
                  <div><strong>调试信息:</strong></div>
                  <div>会话ID: {sessionId || '无'}</div>
                  <div>URL参数: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</div>
                  <div>有会话: {session ? '是' : '否'}</div>
                  <div>有结果: {session?.results ? '是' : '否'}</div>
                </div>
              )}
              
              {/* 解决建议 */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-left">
                <h3 className="font-semibold text-blue-800 mb-2">可能的解决方法:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 确保从历史记录页面正确点击"查看结果"</li>
                  <li>• 检查是否意外删除了评估记录</li>
                  <li>• 清理浏览器缓存后重新评估</li>
                  <li>• 如果问题持续，请重新进行评估</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/history')}>
                  <Clock className="w-4 h-4 mr-2" />
                  查看历史记录
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
                <Button onClick={() => navigate('/assessment')}>
                  <Brain className="w-4 h-4 mr-2" />
                  重新测评
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const sri = session.results.sri;
  const levelInfo = getLevelInfo(sri.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-psychology-calm via-white to-psychology-warm flex flex-col">
      <SEO 
        title="测试结果 - 性压抑指数计算器"
        description="查看您的性压抑测试结果与深度情感健康解析。"
        noindex={true}
      />
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-muted">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="w-4 h-4 mr-2" />
                首页
              </Button>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-psychology-primary" />
                <span className="font-semibold text-psychology-primary">
                  SRI 评估结果
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* 分享按钮 */}
              {isMobile ? (
                <ShareButtonMobile session={session} />
              ) : (
                <ShareResult session={session} />
              )}
              
              {!isShared && (
                isFullReportUnlocked ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="text-muted-foreground hidden sm:flex"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载报告
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="text-muted-foreground sm:hidden"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={scrollToFullReportUnlock}
                      className="text-muted-foreground hidden sm:flex"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      完整报告
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={scrollToFullReportUnlock}
                      className="text-muted-foreground sm:hidden"
                    >
                      <Lock className="w-4 h-4" />
                    </Button>
                  </>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="text-muted-foreground hidden sm:flex"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新测评
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="text-muted-foreground sm:hidden"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 主要结果卡片 */}
        <Card className="sri-card border-2 border-psychology-primary/20">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-psychology-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-psychology-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-psychology-primary mb-2">
              性压抑指数 (SRI)
            </CardTitle>
            <div className="text-4xl sm:text-6xl font-bold text-psychology-primary mb-4">
              {Math.round(sri.totalScore)}
            </div>
            <Badge 
              className={`text-lg px-6 py-2 ${getLevelColorClass(sri.level)}`}
              variant="outline"
            >
              {levelInfo.label}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 分数解释 */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                您的SRI指数为 <span className="font-semibold text-psychology-primary">{Math.round(sri.totalScore)}</span>，
                处于 <span className="font-semibold">{levelInfo.label}</span> 水平
              </p>
              <div className="max-w-2xl mx-auto">
                <Progress value={sri.totalScore} className="h-3 mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (较少压抑)</span>
                  <span>50 (中等)</span>
                  <span>100 (较多压抑)</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* 结果解释 */}
            {session.results.interpretation && session.results.interpretation.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-psychology-primary" />
                  结果解释
                </h3>
                <div className="space-y-2">
                  {session.results.interpretation.map((text, index) => (
                    <p key={index} className="text-muted-foreground leading-relaxed">
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 个性化建议 */}
            {session.results.recommendations && session.results.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-psychology-primary" />
                  个性化建议
                </h3>
                <div className="space-y-2">
                  {session.results.recommendations.map((text, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isShared && (
          <ReportUnlockPanel
            session={session}
            unlocked={isFullReportUnlocked}
            verifying={unlockVerifying}
            verificationError={unlockVerificationError}
          />
        )}

        {isFullReportUnlocked && (
          <>
        {/* 四维度分析 */}
        <Card className="sri-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-psychology-primary" />
              四维度分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">性观感反向 (SOS)</span>
                    <span className="text-sm text-muted-foreground">
                      {sri.dimensionScores.sosReversed.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.abs(sri.dimensionScores.sosReversed) * 20} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">性内疚 (Guilt)</span>
                    <span className="text-sm text-muted-foreground">
                      {sri.dimensionScores.sexGuilt.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.abs(sri.dimensionScores.sexGuilt) * 20} className="h-2" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">性羞耻 (Shame)</span>
                    <span className="text-sm text-muted-foreground">
                      {sri.dimensionScores.sexualShame.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.abs(sri.dimensionScores.sexualShame) * 20} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">抑制优势 (SIS/SES)</span>
                    <span className="text-sm text-muted-foreground">
                      {sri.dimensionScores.sisOverSes.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.abs(sri.dimensionScores.sisOverSes) * 20} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 量表分数详情 */}
        <Card className="sri-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-psychology-primary" />
              详细分数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sri.scaleScores.map((score) => {
                const scale = ALL_SCALES[score.scaleId];
                if (!scale) return null;
                
                return (
                  <div key={score.scaleId} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{scale.name}</h4>
                      <p className="text-sm text-muted-foreground">{scale.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{score.rawScore}</div>
                      <div className="text-xs text-muted-foreground">z: {score.zScore.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">第{score.percentile.toFixed(0)}百分位</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 7天行动计划 */}
        {!isShared && (
          <Card className="sri-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-psychology-primary" />
                7天自我观察计划
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getActionPlan(sri).map((item) => (
                  <div key={item.day} className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm font-semibold text-psychology-primary mb-1">{item.day}</div>
                    <h4 className="font-medium mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
          </>
        )}

        {/* 评估信息 */}
        <Card className="sri-card">
          <CardHeader>
            <CardTitle className="text-lg">评估信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">评估类型:</span>
                <span className="ml-2 font-medium">
                  {session.type === 'quick' ? '快速测评' : '完整测评'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">完成时间:</span>
                <span className="ml-2 font-medium">
                  {session.endTime ? new Date(session.endTime).toLocaleString('zh-CN') : '未知'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">回答题数:</span>
                <span className="ml-2 font-medium">{session.responses.length} 题</span>
              </div>
              <div>
                <span className="text-muted-foreground">会话ID:</span>
                <span className="ml-2 font-mono text-xs">{session.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 重要声明 */}
        <Card className="sri-card border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <h4 className="font-semibold text-yellow-800">重要声明</h4>
                <p className="text-yellow-700 leading-relaxed">
                  本测评结果仅供参考，不构成医学诊断。SRI指数是基于科学研究的心理测量工具，
                  旨在帮助您了解自己的性心理特征。如果您对结果有疑问或需要专业帮助，
                  建议咨询专业的心理健康专家。
                </p>
                <p className="text-yellow-700 leading-relaxed">
                  您的测评答案和结果保存在本地设备上。付费解锁由 Stripe 处理，
                  我们不会接触或存储您的银行卡信息。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分享提示（仅在分享链接访问时显示） */}
        {isShared && (
          <Card className="sri-card border-psychology-primary/30 bg-psychology-primary/5">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-psychology-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-psychology-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-psychology-primary mb-2">
                    欢迎体验SRI性压抑指数评估
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    这是一个由朋友分享的评估结果。想要获得属于自己的专业心理分析吗？
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button 
                      onClick={() => navigate('/assessment')}
                      className="bg-psychology-primary hover:bg-psychology-primary/90"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      开始我的评估
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/')}>
                      <Home className="w-4 h-4 mr-2" />
                      了解更多
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 pt-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          {!isShared && (
            <Button onClick={handleRetake} className="bg-psychology-primary hover:bg-psychology-primary/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新测评
            </Button>
          )}
          
          {/* 大尺寸分享按钮（桌面端） */}
          {!isMobile && !isShared && (
            <ShareResult 
              session={session} 
              className="bg-psychology-accent hover:bg-psychology-accent/90 text-white border-psychology-accent"
            />
          )}
        </div>
      </main>

      {/* 移动端浮动分享按钮 */}
      {isMobile && !isShared && (
        <SocialShareFloating session={session} />
      )}
      <Footer />
    </div>
  );
}

function getActionPlan(sri: SRIResult) {
  const focusAreas = getPrimaryFocusAreas(sri);
  const focusText = focusAreas.length > 0 ? focusAreas.join('、') : '性态度与亲密关系中的情绪反应';

  return [
    {
      day: '第1天',
      title: '记录触发场景',
      description: `留意今天哪些场景会引发${focusText}相关的不适、回避或紧张，只记录事实，不急着评价自己。`,
    },
    {
      day: '第2天',
      title: '区分想法和感受',
      description: '把自动冒出的判断写下来，再单独写身体感受和情绪感受，帮助自己看见内化观念与真实体验的差别。',
    },
    {
      day: '第3天',
      title: '标注安全边界',
      description: '列出让你感到安全、犹豫和明确不舒服的亲密互动边界，边界清楚通常比强迫自己开放更重要。',
    },
    {
      day: '第4天',
      title: '复盘来源线索',
      description: '回想这些观念可能来自家庭、教育、宗教文化、过往关系或创伤经历中的哪一类来源，只做线索整理。',
    },
    {
      day: '第5天',
      title: '练习低风险表达',
      description: '选择一个可信任的人或写给自己的备忘录，用一句中性表达描述自己的需求、困惑或边界。',
    },
    {
      day: '第6天',
      title: '更新一个旧规则',
      description: '找到一个过度严苛的内在规则，尝试改写成更具体、更温和、同时仍保护自己的版本。',
    },
    {
      day: '第7天',
      title: '决定下一步',
      description: '回顾一周记录，选择一个最小行动：继续观察、和伴侣沟通、阅读可靠资料，或在强烈困扰时咨询专业人士。',
    },
  ];
}

function getPrimaryFocusAreas(sri: SRIResult) {
  return [
    { label: '性观感回避', value: sri.dimensionScores.sosReversed },
    { label: '性内疚感', value: sri.dimensionScores.sexGuilt },
    { label: '性羞耻体验', value: sri.dimensionScores.sexualShame },
    { label: '性抑制倾向', value: sri.dimensionScores.sisOverSes },
  ]
    .filter((item) => item.value > 0.75)
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((item) => item.label);
}
