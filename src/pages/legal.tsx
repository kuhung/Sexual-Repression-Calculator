import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Brain, CreditCard, FileText, Lock, RefreshCw, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/common';
import { SEO } from '@/components/SEO';

const LAST_UPDATED = '2026年6月9日';
const CONTACT_URL = 'https://kuhung.me/about';

export function Terms() {
  return (
    <LegalPage
      title="服务条款"
      description="SRI Calculator 的使用规则、付费解锁说明和免责声明。"
      canonicalPath="/terms"
      icon={<FileText className="w-14 h-14 text-psychology-primary" />}
    >
      <PolicySection title="1. 服务性质">
        <p>
          SRI Calculator 是一个教育和自我了解用途的性心理健康自评工具。测评结果、完整报告和行动建议
          均不构成医学诊断、心理治疗、法律意见或紧急援助服务。
        </p>
        <p>
          如果您正在经历强烈痛苦、自伤风险、创伤反应或亲密关系中的现实危险，请优先联系当地紧急服务、
          医疗机构或合格心理健康专业人士。
        </p>
      </PolicySection>

      <PolicySection title="2. 使用资格">
        <p>
          您应在自愿、私密且不被强迫的情况下使用本工具。如果您未达到所在地的法定成年年龄，
          请在监护人同意和适当支持下使用；付费报告应由成年人或监护人购买。
        </p>
      </PolicySection>

      <PolicySection title="3. 付费完整报告">
        <p>
          完整报告是一次性数字内容解锁，适用于当前浏览器中保存的本次测评结果。我们不创建账号，
          也不建立跨设备的报告资料库。
        </p>
        <p>
          因为测评答案和结果默认只保存在您的浏览器本地，如果您清理浏览器数据、更换设备、使用隐私模式，
          或支付后被系统带回另一个浏览器，可能需要重新完成测评。付款日起7天内，您仍可按退款政策申请无条件退款。
        </p>
      </PolicySection>

      <PolicySection title="4. 支付、价格和退款">
        <p>
          支付由 Stripe Checkout 处理。实际可用的支付方式、币种显示和银行处理时间由 Stripe、您的支付方式
          以及发卡行或钱包服务商决定。
        </p>
        <p>
          我们提供付款日起7天内无条件全额退款。具体规则请查看
          <InlineLink to="/refunds">退款政策</InlineLink>。
        </p>
      </PolicySection>

      <PolicySection title="5. 禁止行为">
        <p>
          请勿使用自动化方式滥用服务、攻击接口、规避支付流程、冒充他人付款，或将本工具输出包装成医疗诊断、
          心理治疗结论或专业咨询报告对外销售。
        </p>
      </PolicySection>

      <PolicySection title="6. 服务变更">
        <p>
          我们可能根据产品、合规或安全需要调整页面内容、价格、报告结构或支付方式。已完成的付款仍适用购买时展示的退款承诺。
        </p>
      </PolicySection>

      <PolicySection title="7. 联系方式">
        <p>
          有服务、支付或退款问题，请通过
          <ExternalLink href={CONTACT_URL}>kuhung.me/about</ExternalLink>
          页面列出的公开联系方式联系。
        </p>
      </PolicySection>
    </LegalPage>
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="隐私政策"
      description="SRI Calculator 如何处理本地测评数据、支付信息、分享链接和分析数据。"
      canonicalPath="/privacy"
      icon={<Shield className="w-14 h-14 text-psychology-primary" />}
    >
      <PolicySection title="1. 我们处理哪些数据">
        <p>
          测评答案、人口学选项、SRI 分数、解释文本和历史记录默认保存在您的浏览器本地存储中。
          这些测评数据不会因为查看结果或解锁报告而上传到我们的服务器。
        </p>
        <p>
          当您发起付费解锁时，前端只会向我们的 Vercel API 发送当前本地测评会话 ID，用于创建和校验 Stripe Checkout Session。
          我们不会向 Stripe 发送您的问卷答案、人口学信息、SRI 分数或报告正文。
        </p>
      </PolicySection>

      <PolicySection title="2. 支付数据">
        <p>
          支付由 Stripe 处理。银行卡号、钱包账号、付款认证信息和支付风控信息由 Stripe 根据其自身服务条款和隐私政策处理。
          本站不会接触或存储您的完整银行卡信息。
        </p>
        <p>
          为完成支付校验，Stripe Checkout Session 会包含商品标识和本地测评会话 ID。该 ID 只用于把付款结果与当前浏览器中的测评结果对应起来。
        </p>
      </PolicySection>

      <PolicySection title="3. 本地存储和删除">
        <p>
          您可以在站内历史记录页面删除测评记录，也可以通过浏览器设置清除本地存储。清除本地存储后，我们通常无法恢复您的测评结果或本地解锁状态。
        </p>
      </PolicySection>

      <PolicySection title="4. 分享链接">
        <p>
          如果您主动使用分享功能，分享链接可能包含经过编码的结果摘要，用于让他人看到您选择分享的结果页面。
          请只在您愿意公开该结果摘要时分享链接。
        </p>
      </PolicySection>

      <PolicySection title="5. 分析和日志">
        <p>
          本站使用 Vercel Analytics 了解页面访问和产品使用情况。Vercel 和托管基础设施可能处理必要的请求日志、
          设备信息和错误信息，用于安全、运维和性能分析。
        </p>
      </PolicySection>

      <PolicySection title="6. 退款和支持沟通">
        <p>
          如果您联系退款或支持，我们可能需要您提供付款邮箱、Stripe 收据、支付时间或 Checkout Session 相关信息，
          以确认付款并处理退款。
        </p>
      </PolicySection>

      <PolicySection title="7. 联系方式">
        <p>
          隐私、数据删除或支付数据问题，请通过
          <ExternalLink href={CONTACT_URL}>kuhung.me/about</ExternalLink>
          页面列出的公开联系方式联系。
        </p>
      </PolicySection>
    </LegalPage>
  );
}

export function RefundPolicy() {
  return (
    <LegalPage
      title="退款政策"
      description="SRI Calculator 完整报告的7天无条件退款规则。"
      canonicalPath="/refunds"
      icon={<RefreshCw className="w-14 h-14 text-psychology-primary" />}
    >
      <Card className="border-green-200 bg-green-50/70">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-green-900 mb-2">7天无条件退款</h2>
              <p className="text-sm text-green-800 leading-relaxed">
                购买 SRI 完整报告后，自付款日起7个自然日内，无论原因如何，均可申请一次全额退款。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PolicySection title="1. 适用范围">
        <p>
          本政策适用于通过本站 Stripe Checkout 购买的 SRI 完整报告。退款将退回原支付方式。
        </p>
      </PolicySection>

      <PolicySection title="2. 如何申请">
        <p>
          请通过
          <ExternalLink href={CONTACT_URL}>kuhung.me/about</ExternalLink>
          页面列出的公开联系方式联系我们，并附上付款邮箱、Stripe 收据或付款时间。您无需说明退款原因。
        </p>
      </PolicySection>

      <PolicySection title="3. 处理时间">
        <p>
          我们会在收到足够付款信息后尽快提交 Stripe 退款。退款提交后，实际到账时间取决于 Stripe、
          您的支付方式、发卡行或钱包服务商，通常可能需要数个工作日。
        </p>
      </PolicySection>

      <PolicySection title="4. 本地数据丢失">
        <p>
          如果您因清理浏览器数据、切换设备、隐私模式或支付后未能自动解锁报告而不满意，
          仍可在付款日起7天内按本政策申请无条件退款。
        </p>
      </PolicySection>

      <PolicySection title="5. 滥用处理">
        <p>
          我们保留拒绝明显欺诈、盗刷、恶意批量购买退款或违反服务条款行为的权利。普通用户的一次性不满意退款不受影响。
        </p>
      </PolicySection>
    </LegalPage>
  );
}

interface LegalPageProps {
  title: string;
  description: string;
  canonicalPath: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function LegalPage({ title, description, canonicalPath, icon, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-psychology-calm via-background to-psychology-warm flex flex-col">
      <SEO
        title={`${title} - SRI Calculator`}
        description={description}
        canonicalUrl={`https://sri.kuhung.me${canonicalPath}`}
      />

      <nav className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Brain className="w-8 h-8 text-psychology-primary" />
              <span className="text-xl font-semibold text-foreground">SRI Calculator</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 w-fit">{icon}</div>
          <Badge className="mb-4 bg-psychology-primary/10 text-psychology-primary border-psychology-primary/20">
            Last updated: {LAST_UPDATED}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">{description}</p>
        </div>

        <Card className="sri-card border-yellow-200 bg-yellow-50/50 mb-8">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-700 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-800 leading-relaxed">
                本页面用于说明产品规则和用户权益，不构成法律意见。若法律要求与本页面存在冲突，以适用法律的强制性规定为准。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">{children}</div>

        <Separator className="my-10" />

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/terms">服务条款</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/privacy">隐私政策</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/refunds">退款政策</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="sri-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}

function InlineLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="mx-1 font-medium text-psychology-primary hover:underline">
      {children}
    </Link>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-1 font-medium text-psychology-primary hover:underline"
    >
      {children}
    </a>
  );
}
