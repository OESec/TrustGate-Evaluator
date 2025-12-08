
export enum EvaluationStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  WARN = 'WARN',
  MANUAL_REVIEW = 'MANUAL_REVIEW'
}

export enum Verdict {
  WHITELIST = 'WHITELIST',
  BLOCK = 'BLOCK',
  INVESTIGATE = 'INVESTIGATE'
}

export interface CriterionResult {
  id: string;
  name: string;
  status: EvaluationStatus;
  reason: string;
  weight: number; // 1-10 importance or % based on config
  icon?: string; // Icon identifier or base64 URL
}

export interface EvaluationResponse {
  domain: string;
  riskScore: number; // 0-100 (0 is safe, 100 is dangerous)
  verdict: Verdict;
  summary: string;
  criteria: CriterionResult[];
  timestamp: string;
}

export interface EvaluateRequest {
  domain: string;
  justification: string;
  department: string;
  justificationType: string;
  alternativeSolutions: string;
  securityBlockStatus: string;
  domainReputation?: number;
  virusTotal: {
    maliciousCount: number;
    totalEngines: number;
  };
  virusTotalScore?: number;
}

export interface PolicyOption {
  label: string;
  score: number;
}

export interface PolicyCriterion {
  id: number | string;
  title: string;
  weight: number;
  description: string;
  isMandatory?: boolean;
  options: PolicyOption[];
  icon?: string; // Icon identifier (e.g. 'Shield') or base64 URL
}
