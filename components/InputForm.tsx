
import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Loader2, Globe, FileText, Briefcase, GitFork, ShieldAlert, HelpCircle, Activity, ExternalLink } from 'lucide-react';
import { EvaluateRequest } from '../types';

interface InputFormProps {
  onEvaluate: (data: EvaluateRequest) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onEvaluate, isLoading }) => {
  const [domain, setDomain] = useState('');
  const [justification, setJustification] = useState('');
  
  // Initialize with empty strings to show placeholders
  const [department, setDepartment] = useState('');
  const [justificationType, setJustificationType] = useState('');
  const [alternativeSolutions, setAlternativeSolutions] = useState('');
  const [securityBlockStatus, setSecurityBlockStatus] = useState('');
  const [domainReputation, setDomainReputation] = useState('');
  
  // VirusTotal State
  const [vtMalicious, setVtMalicious] = useState('');
  const [vtTotal, setVtTotal] = useState('');
  const [vtScore, setVtScore] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim() && department && justificationType && alternativeSolutions && securityBlockStatus) {
      onEvaluate({ 
        domain, 
        justification, 
        department, 
        justificationType,
        alternativeSolutions,
        securityBlockStatus,
        domainReputation: domainReputation ? Number(domainReputation) : undefined,
        virusTotal: {
          maliciousCount: Number(vtMalicious) || 0,
          totalEngines: Number(vtTotal) || 0
        },
        virusTotalScore: vtScore !== null ? vtScore : undefined
      });
    } else {
      const form = e.currentTarget as HTMLFormElement;
      if (!form.checkValidity()) {
        form.reportValidity();
      }
    }
  };

  const calculateVTScore = (maliciousCount: number) => {
    if (maliciousCount === 0) return 100;
    if (maliciousCount <= 2) return 50;
    return 0;
  };

  const handleVtMaliciousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVtMalicious(val);
    if (val !== '') {
      setVtScore(calculateVTScore(Number(val)));
    } else {
      setVtScore(null);
    }
  };

  // Helper to determine class for select inputs (gray if placeholder, normal if selected)
  const getSelectClass = (value: string) => {
    const baseClass = "w-full bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none backdrop-blur-sm";
    if (!value) {
      return `${baseClass} text-zinc-400 dark:text-zinc-500`;
    }
    return `${baseClass} text-zinc-900 dark:text-white`;
  };

  const getInputClass = () => "w-full bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono backdrop-blur-sm";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-xl dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-colors duration-300">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-50"></div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Request Evaluator
          </h2>
          <p className="text-zinc-500 dark:text-zinc-300 mt-2 text-sm font-medium">
            Enter domain details to generate a compliance assessment against corporate whitelist criteria.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Target Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., analytics.marketing-tool.com"
                  className={getInputClass()}
                  required
                />
             </div>
             <div className="space-y-2 relative group">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 cursor-help">
                  <Activity className="w-3 h-3" /> 
                  Reputation
                  <HelpCircle className="w-3 h-3 text-zinc-400" />
                </label>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center font-medium">
                  0-100 Score. 0=Bad, 100=Clean. Check Cisco Talos or similar.
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={domainReputation}
                  onChange={(e) => setDomainReputation(e.target.value)}
                  placeholder="e.g. 85 (Optional)"
                  className={getInputClass()}
                />
             </div>
          </div>
          
          {/* VirusTotal Section */}
          <div className="bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
               <label className="text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Threat Intelligence (VirusTotal)
               </label>
               {domain && (
                 <a 
                   href={`https://www.virustotal.com/gui/domain/${domain}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-[10px] font-bold text-cyan-600 hover:text-cyan-500 flex items-center gap-1 bg-white/50 dark:bg-black/30 px-2 py-1 rounded-md border border-cyan-200 dark:border-cyan-800 transition-colors"
                 >
                   Open Report <ExternalLink className="w-3 h-3" />
                 </a>
               )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
               <div className="space-y-1">
                 <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Malicious</span>
                 <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={vtMalicious}
                    onChange={handleVtMaliciousChange}
                    className={`${getInputClass()} py-2 text-center text-rose-500 font-bold`}
                    required
                 />
               </div>
               <div className="space-y-1">
                 <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Total</span>
                 <input
                    type="number"
                    min="0"
                    placeholder="90"
                    value={vtTotal}
                    onChange={(e) => setVtTotal(e.target.value)}
                    className={`${getInputClass()} py-2 text-center`}
                    required
                 />
               </div>
               <div className="space-y-1">
                 <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Score</span>
                 <div className={`${getInputClass()} py-2 text-center font-bold flex items-center justify-center ${vtScore === 100 ? 'text-emerald-500' : vtScore === 50 ? 'text-amber-500' : vtScore === 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
                    {vtScore !== null ? `${vtScore}%` : '-'}
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={getSelectClass(department)}
                required
              >
                <option value="" disabled hidden>Select Department...</option>
                <option value="IT">IT / Security</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                 <FileText className="w-3 h-3" /> Justification Type
               </label>
               <select
                value={justificationType}
                onChange={(e) => setJustificationType(e.target.value)}
                className={getSelectClass(justificationType)}
                required
              >
                <option value="" disabled hidden>Select Type...</option>
                <option value="Business Requirement">Business Requirement</option>
                <option value="Technical Dependency">Technical Dependency</option>
                <option value="Client Request">Client Request</option>
                <option value="Research">Research & Development</option>
                <option value="Training">Training & Education</option>
                <option value="Other">Other</option>
              </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                 <GitFork className="w-3 h-3" /> Alternative Solutions
               </label>
               <select
                value={alternativeSolutions}
                onChange={(e) => setAlternativeSolutions(e.target.value)}
                className={getSelectClass(alternativeSolutions)}
                required
              >
                <option value="" disabled hidden>Assessment of alternatives...</option>
                <option value="No viable alternatives exist">No viable alternatives exist</option>
                <option value="Alternatives exist but inefficient">Alternatives exist but inefficient</option>
                <option value="Reasonable alternatives available">Reasonable alternatives available</option>
                <option value="Safer alternatives readily available">Safer alternatives readily available</option>
              </select>
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                 <ShieldAlert className="w-3 h-3" /> Security Block Status
               </label>
               <select
                value={securityBlockStatus}
                onChange={(e) => setSecurityBlockStatus(e.target.value)}
                className={getSelectClass(securityBlockStatus)}
                required
              >
                <option value="" disabled hidden>Current block status...</option>
                <option value="No security concerns (Category block)">No security concerns (Category block)</option>
                <option value="Minor security flags">Minor security flags</option>
                <option value="Significant security concerns">Significant security concerns</option>
                <option value="Known malicious site">Known malicious site</option>
              </select>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Business Justification</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Why is this domain required? e.g., 'New SaaS platform for Q3 marketing campaign analytics.'"
              className="w-full bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none h-24 backdrop-blur-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !domain || !department || !justificationType || !alternativeSolutions || !securityBlockStatus || !vtTotal}
            className={`w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Criteria...
              </>
            ) : (
              <>
                Initiate Assessment <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;
