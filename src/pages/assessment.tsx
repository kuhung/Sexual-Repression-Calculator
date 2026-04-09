/**
 * 评估页面 - 问卷系统主界面
 * 负责管理整个评估流程，包括知情同意、人口学信息、量表问卷等
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, ArrowLeft, Home, Brain } from 'lucide-react';
import { AssessmentSession, Demographics, Response } from '@/types';
import { calculateAssessmentResults } from '@/lib/calculator';
import { saveAssessmentSession } from '@/lib/storage';
import { ConsentForm } from '@/components/assessment/consent-form';
import { DemographicsForm } from '@/components/assessment/demographics-form';
import { QuestionnaireSection } from '@/components/assessment/questionnaire-section';

type AssessmentStep = 'consent' | 'demographics' | 'questionnaire' | 'processing' | 'completed';

import { SEO } from '@/components/SEO';

export default function Assessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 获取评估类型
  const assessmentType = (searchParams.get('type') as 'quick' | 'full') || 'quick';
  
  const seoTitle = assessmentType === 'quick' 
    ? "快速性压抑测试 (8-15分钟) - 免费情感健康评估" 
    : "完整性压抑测试 (25-40分钟) - 深度情感健康评估";
  const seoDesc = assessmentType === 'quick'
    ? "参与免费且保密的快速性压抑测试，初步了解您的情感健康与性心理特征。"
    : "参与免费且保密的完整性压抑测试，基于科学量表全面深度解析您的情感健康与性心理特征。";

  // 状态管理
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('consent');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [session, setSession] = useState<AssessmentSession | null>(null);

  // 初始化会话
  useEffect(() => {
    const newSession: AssessmentSession = {
      id: sessionId,
      type: assessmentType,
      demographics: {} as Demographics,
      responses: [],
      startTime: new Date(),
      completed: false
    };
    setSession(newSession);
  }, [sessionId, assessmentType]);

  // 检测是否为未成年人
  const isMinorUser = demographics?.age === '0'; // 14-17岁年龄段

  // 处理知情同意
  const handleConsent = (consented: boolean) => {
    if (!consented) {
      navigate('/');
      return;
    }
    setCurrentStep('demographics');
  };

  // 处理人口学信息提交
  const handleDemographicsSubmit = (demographicsData: Demographics) => {
    setDemographics(demographicsData);
    if (session) {
      const updatedSession = {
        ...session,
        demographics: demographicsData
      };
      setSession(updatedSession);
      saveAssessmentSession(updatedSession);
    }
    setCurrentStep('questionnaire');
  };

  // 处理问卷回答更新
  const handleResponseUpdate = (newResponses: Response[]) => {
    setResponses(newResponses);
    if (session) {
      const updatedSession = {
        ...session,
        responses: newResponses
      };
      setSession(updatedSession);
      saveAssessmentSession(updatedSession);
    }
  };

  // 处理问卷完成
  const handleQuestionnaireComplete = async () => {
    if (!session || !demographics) return;

    setCurrentStep('processing');

    try {
      // 计算结果
      const results = calculateAssessmentResults(responses, sessionId);
      
      // 更新会话
      const completedSession: AssessmentSession = {
        ...session,
        responses,
        results,
        endTime: new Date(),
        completed: true
      };

      setSession(completedSession);
      saveAssessmentSession(completedSession);

      // 跳转到结果页面
      setTimeout(() => {
        navigate(`/results?sessionId=${sessionId}`);
      }, 2000);

    } catch (error) {
      console.error('Error calculating results:', error);
      alert('计算结果时发生错误，请重试。');
      setCurrentStep('questionnaire');
    }
  };

  // 获取步骤进度
  const getStepProgress = () => {
    const steps = ['consent', 'demographics', 'questionnaire', 'processing'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // 返回上一步
  const handleBack = () => {
    switch (currentStep) {
      case 'demographics':
        setCurrentStep('consent');
        break;
      case 'questionnaire':
        setCurrentStep('demographics');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-psychology-calm via-white to-psychology-warm">
      <SEO 
        title={seoTitle}
        description={seoDesc}
        canonicalUrl={`https://sri.kuhung.me/assessment?type=${assessmentType}`}
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
                  {assessmentType === 'quick' ? '快速测评' : '完整测评'}
                </span>
              </div>
            </div>

            {currentStep !== 'processing' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hidden sm:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            )}
            {currentStep !== 'processing' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground sm:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* 总体进度条 */}
          {currentStep !== 'consent' && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">整体进度</span>
                <span className="text-sm font-medium">{Math.round(getStepProgress())}%</span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>
          )}
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        {/* 知情同意书 */}
        {currentStep === 'consent' && (
          <ConsentForm 
            onConsent={handleConsent}
            isMinor={isMinorUser}
          />
        )}

        {/* 人口学信息表单 */}
        {currentStep === 'demographics' && (
          <DemographicsForm
            onSubmit={handleDemographicsSubmit}
            onBack={handleBack}
            initialData={demographics || undefined}
          />
        )}

        {/* 问卷主界面 */}
        {currentStep === 'questionnaire' && demographics && (
          <QuestionnaireSection
            type={assessmentType}
            demographics={demographics}
            responses={responses}
            onResponseUpdate={handleResponseUpdate}
            onComplete={handleQuestionnaireComplete}
            onBack={handleBack}
          />
        )}

        {/* 处理中状态 */}
        {currentStep === 'processing' && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="sri-card p-12">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-psychology-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-psychology-primary animate-pulse" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-psychology-primary mb-2">
                    正在分析您的回答
                  </h2>
                  <p className="text-muted-foreground">
                    我们正在使用科学算法计算您的性压抑指数，请稍候...
                  </p>
                </div>

                <div className="space-y-3">
                  <Progress value={100} className="h-2" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>应用多维度标准化算法</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>生成个性化分析报告</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>保护您的隐私数据</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* 底部提示 */}
      {currentStep === 'questionnaire' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-muted p-3 sm:p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">您的所有回答都会安全地保存在本地设备上</span>
                <span className="sm:hidden">数据安全保存</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                已回答: {responses.length} 题
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}