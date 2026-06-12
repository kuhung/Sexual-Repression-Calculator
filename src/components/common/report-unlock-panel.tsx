import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, CreditCard, FileText, Lock, Shield, Sparkles } from "lucide-react";
import { AssessmentSession } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackClientPaymentEvent } from "@/lib/payment-analytics";
import { PAYMENT_EVENTS } from "@/lib/payment-events";

export interface ReportUnlockPanelProps {
  session: AssessmentSession;
  unlocked: boolean;
  verifying?: boolean;
  verificationError?: string | null;
}

const FULL_REPORT_PRICE_LABEL = import.meta.env.PUBLIC_SRI_REPORT_PRICE_LABEL || "￥9.9";
const CHECKOUT_UNAVAILABLE_MESSAGE = "支付接口暂时不可用，请稍后重试或联系支持。";

export function ReportUnlockPanel({
  session,
  unlocked,
  verifying = false,
  verificationError = null,
}: ReportUnlockPanelProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    const startedAt = performance.now();

    trackClientPaymentEvent(PAYMENT_EVENTS.checkoutIntent, {
      assessment_type: session.type,
      source: "results_unlock_panel",
    });

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: session.id }),
      });

      const rawResponse = await response.text();
      let data: { url?: string; error?: string } = {};

      try {
        data = rawResponse ? JSON.parse(rawResponse) : {};
      } catch {
        data = { error: CHECKOUT_UNAVAILABLE_MESSAGE };
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || CHECKOUT_UNAVAILABLE_MESSAGE);
      }

      window.location.href = data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : CHECKOUT_UNAVAILABLE_MESSAGE;
      trackClientPaymentEvent(PAYMENT_EVENTS.checkoutClientFailed, {
        assessment_type: session.type,
        source: "results_unlock_panel",
        elapsed_ms: Math.round(performance.now() - startedAt),
      });
      setCheckoutError(message);
      setCheckoutLoading(false);
    }
  };

  if (unlocked) {
    return (
      <Card id="full-report-unlock" className="sri-card border-green-200 bg-green-50/60">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">完整报告已解锁</h3>
                <p className="text-sm text-green-800 mt-1">
                  当前浏览器已可查看详细维度、量表分数、深度建议和报告下载。
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
              Full Report
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="full-report-unlock" className="sri-card border-2 border-psychology-primary/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge className="w-fit bg-psychology-primary/10 text-psychology-primary border-psychology-primary/20">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              完整报告
            </Badge>
            <CardTitle className="text-xl sm:text-2xl text-foreground">解锁更详细的 SRI 分析</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              基础结果仅提供压抑程度评估。完整报告包含您的具体得分、深度结果解释、个性化深度建议、四个维度的详细分析与原始量表分数。
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold text-psychology-primary">{FULL_REPORT_PRICE_LABEL}</div>
            <p className="text-xs text-muted-foreground mt-1">一次性解锁本次结果</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Feature icon={<FileText className="w-4 h-4" />} text="具体得分与深度结果解释" />
          <Feature icon={<Shield className="w-4 h-4" />} text="四个核心维度详细解读" />
          <Feature icon={<Sparkles className="w-4 h-4" />} text="个性化深度建议" />
          <Feature icon={<Lock className="w-4 h-4" />} text="原始量表分数和百分位" />
        </div>

        {(checkoutError || verificationError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{checkoutError || verificationError}</AlertDescription>
          </Alert>
        )}

        {verifying && (
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>正在确认 Stripe 支付状态，请稍候...</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            onClick={startCheckout}
            disabled={checkoutLoading || verifying}
            className="bg-psychology-primary hover:bg-psychology-primary/90 text-white"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {checkoutLoading ? "正在跳转 Stripe..." : `支付 ${FULL_REPORT_PRICE_LABEL} 解锁`}
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            通过 Stripe 安全结账。支付成功后会返回本站并自动解锁，不需要注册账号。
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          点击支付即表示您已阅读并同意我们的
          <PolicyLink to="/terms">服务条款</PolicyLink>、
          <PolicyLink to="/privacy">隐私政策</PolicyLink>
          和
          <PolicyLink to="/refunds">退款政策</PolicyLink>。付款日起7天内可无条件全额退款，请发送订单时间与邮箱至 sri@kuhung.me 申请。
        </p>
      </CardContent>
    </Card>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <span className="text-psychology-primary">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function PolicyLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="mx-1 font-medium text-psychology-primary hover:underline">
      {children}
    </Link>
  );
}
