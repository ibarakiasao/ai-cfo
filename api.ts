// ==========================================
// API Type Definitions: グループ資金可視化システム (AI-CFO)
// Spec Version: 0.1.0
// ==========================================

import { Currency, TransactionStatus, RiskLevel } from "@prisma/client";

// ------------------------------------------
// 共通レスポンス型 (Base API Envelope)
// ------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ------------------------------------------
// F-1: CSVデータインポート API (`POST /api/v1/import`)
// ------------------------------------------

export interface ImportCsvRequest {
  companyId: string;
  cashAccountId?: string;
  sourceType?: "freee" | "moneyforward" | "custom_csv";
  // クライアント側でパース済みの行データまたはBase64文字列
  rows: Array<{
    date: string;          // YYYY-MM-DD
    amount: number;        // 正: 入金, 負: 出金
    category?: string;     // 勘定科目（空の場合はAIが自動割り当て）
    partnerName?: string;  // 取引先名
    description?: string;  // 摘要
  }>;
}

export interface ImportCsvResponseData {
  importedCount: number;
  mappedCategoriesCount: number;
  sourceFileId: string;
  warnings?: string[];
}

// ------------------------------------------
// F-2: 合成資金ダッシュボード取得 API (`GET /api/v1/dashboard/summary`)
// ------------------------------------------

export interface DashboardSummaryQuery {
  companyId?: string; // 指定しない場合はグループ全社
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface CompanyBalanceSummary {
  companyId: string;
  companyName: string;
  currentBalance: number;
  currency: Currency;
  sharePercentage: number; // 全体に対する割合 (0-100)
}

export interface CashTrendPoint {
  date: string;              // YYYY-MM-DD
  actualBalance?: number;    // 実績残高
  predictedBalance?: number; // AI予測残高
  hasRiskAlert: boolean;     // 危険域フラグ
}

export interface DashboardSummaryResponseData {
  asOfDate: string;
  totalGroupBalance: number;
  companyBalances: CompanyBalanceSummary[];
  trend: CashTrendPoint[];
  activeAlertCount: number;
}

// ------------------------------------------
// F-3: AI資金予測＆ショートアラート API (`GET /api/v1/forecast`)
// ------------------------------------------

export interface ForecastQuery {
  companyId: string;
  daysAhead?: number; // 予測期間（デフォルト: 90日）
}

export interface ForecastItem {
  date: string;
  predictedBalance: number;
  riskLevel: RiskLevel;
  aiComment?: string;
}

export interface ForecastResponseData {
  companyId: string;
  companyName: string;
  generatedAt: string;
  forecasts: ForecastItem[];
  riskSummary: {
    minimumBalance: number;
    minimumBalanceDate: string;
    overallRiskLevel: RiskLevel;
  };
}

// ------------------------------------------
// F-4: 社内融資提案（グループ内最適化） API (`GET /api/v1/insights/intercompany-loans`)
// ------------------------------------------

export interface IntercompanyLoanRecommendation {
  id: string;
  sourceCompanyId: string;
  sourceCompanyName: string;
  sourceAvailableBalance: number; // 貸出可能な余剰資金
  targetCompanyId: string;
  targetCompanyName: string;
  targetRequiredAmount: number;   // 不足見込み額
  recommendedAmount: number;      // 提案融金額
  estimatedCostSaving: number;    // 回避できる銀行借入金利等のコスト減効
  reasoning: string;              // AIによる提案理由コメント
}

export interface InsightsLoanResponseData {
  generatedAt: string;
  recommendations: IntercompanyLoanRecommendation[];
}