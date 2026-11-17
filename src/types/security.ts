export type ApkSecurityStatus =
  | "pending"
  | "clean"
  | "suspicious"
  | "malicious"
  | "failed";

export interface SecurityEngineHighlight {
  engineName: string;
  category: "undetected" | "harmless" | "suspicious" | "malicious";
  result: string | null;
}

export interface ApkSecuritySummary {
  id: string;
  appId: string;
  version: string;
  sha256: string;
  provider: string;
  status: ApkSecurityStatus;
  maliciousCount: number;
  suspiciousCount: number;
  undetectedCount: number;
  totalEngines: number;
  permalink?: string;
  scannedAt?: string;
}

export interface ApkSecurityReportDetail extends ApkSecuritySummary {
  apkFileName?: string;
  analysisId?: string;
  engineHighlights: SecurityEngineHighlight[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
