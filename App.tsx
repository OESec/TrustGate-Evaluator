import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import PolicyConfig from './components/PolicyConfig';
import { evaluateDomain } from './services/geminiService';
import { EvaluateRequest, EvaluationResponse, PolicyCriterion } from './types';
import { ShieldCheck, LayoutDashboard, FileText, Activity, Moon, Sun } from 'lucide-react';

const initialCriteria: PolicyCriterion[] = [
  {
    id: 1,
    title: "Approved by user's manager?",
    isMandatory: true,
    weight: 15,
    description: "Indicates whether the user's direct manager or supervisor has approved this website access request. Manager approval provides an additional layer of oversight.",
    icon: "UserCheck",
    options: [
      { label: "Yes", score: 100 },
      { label: "Not approved", score: 0 }
    ]
  },
  {
    id: 3,
    title: "Alternative Solutions Available?",
    weight: 15,
    description: "Assesses whether there are safer alternative methods to achieve the same business objective without whitelisting the potentially risky website.",
    icon: "GitFork",
    options: [
      { label: "Alternative Solution(s) NOT available", score: 100 },
      { label: "Alternative Solution(s) available", score: 0 }
    ]
  },
  {
    id: 4,
    title: "Probably misclassified?",
    weight: 5,
    description: "Assesses whether the website appears to have been incorrectly categorized or blocked by automated systems.",
    icon: "HelpCircle",
    options: [
      { label: "Clearly misclassified", score: 100 },
      { label: "Correctly classified", score: 0 }
    ]
  },
  {
    id: 5,
    title: "Blocked due to security reasons?",
    weight: 20,
    description: "Determines if the website was blocked specifically due to security concerns such as malware, phishing, suspicious activity, or known threats.",
    icon: "ShieldAlert",
    options: [
      { label: "No security concerns", score: 100 },
      { label: "Minor security flags", score: 60 },
      { label: "Significant security concerns", score: 20 },
      { label: "Known malicious site", score: 0 }
    ]
  },
  {
    id: 6,
    title: "Has a Business Justification?",
    weight: 15,
    description: "Evaluates whether there is a legitimate business need for accessing this website. Strong business justification is essential for whitelisting requests.",
    icon: "Briefcase",
    options: [
      { label: "Business Justification(s) provided", score: 100 },
      { label: "Business Justification(s) NOT provided", score: 0 }
    ]
  },
  {
    id: 7,
    title: "VirusTotal Threat Intelligence",
    weight: 20,
    description: "Analysis of the domain using VirusTotal's multi-vendor threat detection engine. Any flagged malicious activity significantly impacts the score.",
    icon: "Activity",
    options: [
      { label: "Clean (0 malicious vendors)", score: 100 },
      { label: "Suspicious (1-2 vendors)", score: 50 },
      { label: "Malicious (3+ vendors)", score: 0 }
    ]
  },
  {
    id: 8,
    title: "Blocked due to unwanted category reasons?",
    weight: 10,
    description: "URL does not fit into implicitly blocked categories e.g. weapons.",
    icon: "AlertTriangle",
    options: [
      { label: "Safe category", score: 100 },
      { label: "Unclear", score: 50 },
      { label: "Blocked/Unwanted category", score: 0 }
    ]
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'evaluator' | 'policy'>('evaluator');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Theme state
  const [isDark, setIsDark] = useState(true);

  // Policy State with Persistence (Incremented version to v9)
  const [policyItems, setPolicyItems] = useState<PolicyCriterion[]>(() => {
    try {
      const saved = localStorage.getItem('trustgate_policy_criteria_v9');
      return saved ? JSON.parse(saved) : initialCriteria;
    } catch (e) {
      return initialCriteria;
    }
  });

  // Initialize theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle Print Events to force Light Mode
  useEffect(() => {
    const handleBeforePrint = () => {
      // Force light mode for print
      document.documentElement.classList.remove('dark');
    };

    const handleAfterPrint = () => {
      // Restore dark mode if it was enabled
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isDark]);

  // Persist policy changes
  useEffect(() => {
    localStorage.setItem('trustgate_policy_criteria_v9', JSON.stringify(policyItems));
  }, [policyItems]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleEvaluation = async (request: EvaluateRequest) => {
    setLoading(true);
    setError(null);
    try {
      // Pass the current custom policy to the evaluator
      const data = await evaluateDomain(request, policyItems);
      setResult(data);
    } catch (err) {
      setError("Unable to complete evaluation. Please check your network or API limits.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleResetPolicy = () => {
    if (window.confirm("Are you sure you want to reset the policy to default settings? This cannot be undone.")) {
      setPolicyItems(initialCriteria);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-zinc-50 text-zinc-900'} selection:bg-cyan-500/30 selection:text-cyan-700 dark:selection:text-cyan-200`}>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className={`border-b transition-colors duration-300 sticky top-0 z-50 ${isDark ? 'border-zinc-900 bg-zinc-950/80' : 'border-zinc-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('evaluator')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-white' : 'bg-black'}`}>
               <ShieldCheck className={`w-5 h-5 ${isDark ? 'text-black' : 'text-white'}`} />
            </div>
            <span className={`font-bold tracking-tight text-lg ${isDark ? 'text-white' : 'text-black'}`}>TrustGate</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <button 
                onClick={() => setCurrentView('evaluator')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  currentView === 'evaluator' 
                    ? (isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black') 
                    : (isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-black hover:bg-zinc-100')
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Evaluator
              </button>
              <button 
                onClick={() => setCurrentView('policy')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  currentView === 'policy' 
                    ? (isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black') 
                    : (isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-black hover:bg-zinc-100')
                }`}
              >
                <FileText className="w-4 h-4" />
                Policy Config
              </button>
              <button className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                <Activity className="w-4 h-4" />
                Logs
              </button>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-yellow-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-orange-500'}`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            
            <div className={`w-8 h-8 rounded-full border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-200 border-zinc-300'}`}></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex-grow w-full z-0">
        {currentView === 'evaluator' ? (
          <>
            {error && (
               <div className="max-w-2xl mx-auto mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-lg text-sm flex items-center justify-center animate-in fade-in zoom-in-95 backdrop-blur-md">
                 {error}
               </div>
            )}

            {!result ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="text-center mb-12">
                   <h1 className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                     Domain Whitelist <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Criteria Evaluator</span>
                   </h1>
                   <p className={`max-w-lg mx-auto text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                     Streamline IT governance. Analyze domains against corporate security policies instantly using heuristic analysis.
                   </p>
                 </div>
                 <InputForm onEvaluate={handleEvaluation} isLoading={loading} />
              </div>
            ) : (
              <ResultsView data={result} onReset={handleReset} />
            )}
          </>
        ) : (
          <PolicyConfig 
            items={policyItems} 
            setItems={setPolicyItems} 
            onResetDefaults={handleResetPolicy} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 transition-colors ${isDark ? 'border-zinc-900 bg-zinc-950/50 text-zinc-500' : 'border-zinc-200 bg-white/50 text-zinc-500'} backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-6 text-center text-xs">
          <p>© 2025 TrustGate Security Systems. Internal Use Only.</p>
          <p className="mt-2 opacity-70">Evaluations provided by Gemini 2.5 Flash Model.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;