import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeft,
  Activity,
  Lock,
  Globe2,
  Share2,
  Shield,
  UserCheck,
  Globe,
  Briefcase,
  FileText,
  Cpu,
  Server,
  Eye,
  Zap,
  GitFork,
  HelpCircle,
  Download,
  Printer
} from 'lucide-react';
import { EvaluationResponse, Verdict, EvaluationStatus } from '../types';

interface ResultsViewProps {
  data: EvaluationResponse;
  onReset: () => void;
}

// Map strings to Components (Must match PolicyConfig for consistency)
const IconMap: Record<string, React.FC<any>> = {
  Shield, UserCheck, Lock, Globe, Briefcase, FileText, Cpu, Server, Eye, Zap, 
  GitFork, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle
};

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset }) => {
  const getVerdictColor = (v: Verdict) => {
    switch (v) {
      case Verdict.WHITELIST: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20';
      case Verdict.BLOCK: return 'text-rose-600 dark:text-rose-500 bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
      case Verdict.INVESTIGATE: return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: EvaluationStatus) => {
    switch (status) {
      case EvaluationStatus.PASS: return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case EvaluationStatus.FAIL: return <XCircle className="w-5 h-5 text-rose-500" />;
      case EvaluationStatus.WARN: return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case EvaluationStatus.MANUAL_REVIEW: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-500 dark:text-emerald-400';
    if (score < 70) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-500';
  };

  const renderCriterionIcon = (iconName?: string) => {
    if (!iconName) return <Shield className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />;
    
    // Check if base64 or url
    if (iconName.startsWith('data:') || iconName.startsWith('http')) {
       return <img src={iconName} alt="icon" className="w-5 h-5 object-contain rounded-sm" />;
    }

    const IconComponent = IconMap[iconName] || Shield;
    return <IconComponent className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />;
  };

  const handleWhois = () => {
    window.open(`https://who.is/whois/${data.domain}`, '_blank');
  };

  const handleSsl = () => {
    window.open(`https://www.ssllabs.com/ssltest/analyze.html?d=${data.domain}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportContent = `
TRUSTGATE SECURITY EVALUATION REPORT
================================================================================
Generated: ${new Date(data.timestamp).toLocaleString()}
Domain:    ${data.domain}

EVALUATION RESULTS
--------------------------------------------------------------------------------
Verdict:     ${data.verdict}
Risk Score:  ${data.riskScore}/100
Summary:     ${data.summary}

CRITERIA BREAKDOWN
--------------------------------------------------------------------------------
${data.criteria.map((c, i) => `
${i + 1}. ${c.name.toUpperCase()}
   Status:  ${c.status}
   Weight:  ${c.weight}%
   Reason:  ${c.reason}
`).join('\n')}
--------------------------------------------------------------------------------
© TrustGate Security Systems
`.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TrustGate_Report_${data.domain.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onReset}
        className="mb-6 flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Evaluator
      </button>

      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Verdict Card */}
        <div className={`col-span-2 p-6 rounded-2xl border ${getVerdictColor(data.verdict)} relative overflow-hidden flex flex-col justify-between transition-colors duration-300`}>
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold opacity-70 tracking-widest uppercase">Recommendation</h3>
                <h1 className="text-4xl font-bold mt-1 tracking-tight">{data.verdict}</h1>
              </div>
              <ShieldAlert className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm opacity-90 leading-relaxed max-w-prose font-medium">
              {data.summary}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 text-xs opacity-70 font-mono font-medium">
            <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            <span>•</span>
            <span>{new Date(data.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className="col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center relative transition-colors duration-300 shadow-sm">
          <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest absolute top-6 left-6">Risk Score</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Simple SVG Gauge */}
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-zinc-200 dark:text-zinc-800"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={351.86}
                strokeDashoffset={351.86 - (351.86 * data.riskScore) / 100}
                className={`${getScoreColor(data.riskScore)} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(data.riskScore)}`}>{data.riskScore}</span>
              <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          Criteria Breakdown
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
            {data.criteria.map((criterion, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-5 transition-all flex items-start gap-4 group shadow-sm"
              >
                <div className="mt-1 bg-zinc-50 dark:bg-zinc-950 rounded-full p-1 border border-zinc-200 dark:border-zinc-800 shrink-0">
                   {getStatusIcon(criterion.status)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800/50">
                        {renderCriterionIcon(criterion.icon)}
                      </div>
                      <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">{criterion.name}</h4>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ml-2 ${
                      criterion.status === 'PASS' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-500 bg-emerald-500/10' :
                      criterion.status === 'FAIL' ? 'border-rose-500/30 text-rose-600 dark:text-rose-500 bg-rose-500/10' :
                      'border-amber-500/30 text-amber-600 dark:text-amber-500 bg-amber-500/10'
                    }`}>
                      {criterion.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-300 mt-2 leading-relaxed font-medium pl-9">
                    {criterion.reason}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap justify-end gap-4">
        <button 
          onClick={handleWhois}
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Globe2 className="w-4 h-4" /> WHOIS Lookup
        </button>
        <button 
          onClick={handleSsl}
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Lock className="w-4 h-4" /> SSL Verify
        </button>
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2 hidden sm:block"></div>
        <button 
           onClick={handlePrint}
           className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
         >
          <Printer className="w-4 h-4" /> Print View
        </button>
         <button 
           onClick={handleDownloadReport}
           className="text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 text-sm font-bold transition-colors flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1.5 rounded-lg border border-cyan-100 dark:border-cyan-800/50"
         >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>
    </div>
  );
};

export default ResultsView;