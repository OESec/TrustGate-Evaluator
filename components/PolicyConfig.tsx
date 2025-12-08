import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Info, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  GripVertical,
  Pencil,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  Shield,
  UserCheck,
  Lock,
  Globe,
  Briefcase,
  Cpu,
  Server,
  Eye,
  Zap,
  GitFork,
  ShieldAlert,
  Upload
} from 'lucide-react';
import { PolicyCriterion } from '../types';

interface PolicyConfigProps {
  items: PolicyCriterion[];
  setItems: (items: PolicyCriterion[]) => void;
  onResetDefaults: () => void;
}

// Map strings to Components
const IconMap: Record<string, React.FC<any>> = {
  Shield, UserCheck, Lock, Globe, Briefcase, FileText, Cpu, Server, Eye, Zap, 
  GitFork, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle
};

const PRESET_ICONS = Object.keys(IconMap);

const PolicyConfig: React.FC<PolicyConfigProps> = ({ items, setItems, onResetDefaults }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const totalWeight = items.reduce((acc, curr) => acc + curr.weight, 0);
  const isWeightValid = totalWeight === 100;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    if (isEditing) return; // Disable drag during edit
    dragItem.current = position;
    e.dataTransfer.effectAllowed = 'move';
    const element = e.target as HTMLElement;
    element.classList.add('opacity-50');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    if (isEditing) return;
    e.preventDefault();
    dragOverItem.current = position;
    
    if (dragItem.current !== null && dragItem.current !== position) {
      const newItems = [...items];
      const draggedItemContent = newItems[dragItem.current];
      newItems.splice(dragItem.current, 1);
      newItems.splice(position, 0, draggedItemContent);
      dragItem.current = position;
      setItems(newItems);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (isEditing) return;
    dragItem.current = null;
    dragOverItem.current = null;
    const element = e.target as HTMLElement;
    element.classList.remove('opacity-50');
  };

  const updateItem = (index: number, field: keyof PolicyCriterion, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const deleteItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const addNewItem = () => {
    const newItem: PolicyCriterion = {
      id: items.length + 1,
      title: "New Criterion",
      weight: 0,
      description: "Enter a description for this criterion.",
      isMandatory: false,
      icon: "Shield",
      options: [
        { label: "High Pass", score: 100 },
        { label: "Medium Pass", score: 50 },
        { label: "Fail", score: 0 }
      ]
    };
    setItems([...items, newItem]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50000) { // 50KB limit
        alert("Image too large. Please upload a small icon (under 50KB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(index, 'icon', reader.result as string);
        setActiveIconPicker(null); // Close picker
      };
      reader.readAsDataURL(file);
    }
  };

  const getOptionStyles = (score: number) => {
    if (score >= 80) return {
      container: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-100',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />,
      star: <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
    };
    if (score >= 60) return {
      container: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-700 dark:text-yellow-100',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />,
      star: null
    };
    if (score >= 40) return {
      container: 'border-orange-500/20 bg-orange-500/5 text-orange-700 dark:text-orange-100',
      icon: <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-500" />,
      star: null
    };
    return {
      container: 'border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-100',
      icon: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-500" />,
      star: null
    };
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <Shield className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
    
    // Check if base64 or url
    if (iconName.startsWith('data:') || iconName.startsWith('http')) {
       return <img src={iconName} alt="icon" className="w-6 h-6 object-contain rounded-sm" />;
    }

    const IconComponent = IconMap[iconName] || Shield;
    return <IconComponent className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
  };

  const exportToCSV = () => {
    const headers = ["ID", "Criterion", "Weight", "Description", "Mandatory", "Options"];
    const csvContent = items.map(item => {
      const optionsStr = item.options.map(o => `${o.label} (${o.score})`).join('; ');
      return [
        item.id,
        `"${item.title.replace(/"/g, '""')}"`,
        item.weight,
        `"${item.description.replace(/"/g, '""')}"`,
        item.isMandatory ? "Yes" : "No",
        `"${optionsStr.replace(/"/g, '""')}"`
      ].join(",");
    });
    const csvString = [headers.join(","), ...csvContent].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trustgate_policy_criteria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Page Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 no-print">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            Security Criteria Reference
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl text-sm leading-relaxed font-medium">
            Configure the security evaluation criteria used by the AI engine. Customizing weights and descriptions here will directly impact the TrustGate analysis.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
           <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm border ${
              isEditing 
                ? 'bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-700' 
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
            }`}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {isEditing ? 'Save Changes' : 'Customize Policy'}
          </button>
           {isEditing && (
            <button 
              onClick={onResetDefaults}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg text-sm font-medium transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>
          )}
          {!isEditing && (
            <>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-transparent rounded-lg text-sm font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation Banner */}
      {!isWeightValid && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 animate-pulse no-print">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">
            Warning: Total weight is {totalWeight}%. It must sum to exactly 100% for accurate AI evaluation.
          </p>
        </div>
      )}

      {/* Info / Legend Panel */}
      {!isEditing && (
        <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-6 mb-10 relative overflow-hidden transition-colors duration-300 no-print">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
          <div className="flex items-start gap-4">
            <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100">How to use this reference</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-cyan-800 dark:text-cyan-200/70 font-medium">
                <li className="flex items-start gap-2">
                   <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-500/20 p-1 rounded shrink-0">
                     <Star className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                  </div>
                  <span><strong className="text-cyan-900 dark:text-cyan-100">Preferred options</strong> are marked with a star and represent the highest-scoring choice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0">
                     <span className="font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-800 rounded px-1.5 py-0.5 text-xs">%</span>
                  </div>
                  <span><strong className="text-cyan-900 dark:text-cyan-100">Weights</strong> show the relative importance of each criterion in the overall score.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 flex gap-1 items-center shrink-0">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                     <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                     <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  </div>
                  <span><strong className="text-cyan-900 dark:text-cyan-100">Color coding:</strong> Green (80-100) = Low risk, Yellow (60-79) = Medium, Orange (40-59) = High, Red (0-39) = Critical.</span>
                </li>
                <li className="flex items-start gap-2">
                   <div className="mt-2 w-2 h-2 rounded-full bg-rose-500 shrink-0 mx-2"></div>
                   <span><strong className="text-cyan-900 dark:text-cyan-100">= Mandatory requirement.</strong> Must be met for approval.</span>
                </li>
                <li className="flex items-start gap-2 md:col-span-2">
                   <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                   <span>Export individual platform criteria or all platforms to CSV for offline reference.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Table-like Layout */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl transition-colors duration-300">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-6 p-6 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider rounded-t-[15px]">
          <div className="col-span-3">Criterion</div>
          <div className="col-span-1 text-center group relative flex items-center justify-center gap-1 cursor-help">
            Weight
            <HelpCircle className="w-3 h-3 text-zinc-400" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-zinc-800 text-zinc-100 text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium normal-case tracking-normal border border-zinc-700">
              Weights determine the relative impact of each criterion.
            </div>
          </div>
          <div className="col-span-4">Description</div>
          <div className="col-span-4">Available Options</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
          {items.map((c, index) => (
            <div 
              key={c.id} 
              className={`grid grid-cols-1 md:grid-cols-12 gap-6 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors duration-200 first:rounded-t-[15px] md:first:rounded-none cursor-move group ${isEditing ? 'cursor-default' : 'active:cursor-grabbing'}`}
              draggable={!isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              
              {/* Criterion Column - Stacked Vertical Layout */}
              <div className="col-span-1 md:col-span-3 relative">
                <div className="md:hidden text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Criterion</div>
                <div className="flex items-start gap-4">
                  {/* Indicators Column (Left): Serial + Icon */}
                  <div className="flex flex-col items-center gap-3 shrink-0 min-w-[32px] pt-1">
                     {/* Serial Number */}
                     <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 text-xs font-bold text-zinc-500 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-600 shadow-sm">
                        {index + 1}
                     </div>

                     {/* Icon / Controls */}
                     <div className="flex flex-col items-center gap-2 no-print shrink-0">
                        {!isEditing ? (
                            <>
                              <div className="text-zinc-300 dark:text-zinc-600 cursor-grab active:cursor-grabbing hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800">
                                {renderIcon(c.icon)}
                              </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 items-center">
                              <button 
                                onClick={() => deleteItem(index)}
                                className="text-rose-400 hover:text-rose-600 transition-colors"
                                title="Delete Criterion"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              
                              {/* Icon Selector Button */}
                              <div className="relative">
                                <button
                                  onClick={() => setActiveIconPicker(activeIconPicker === index ? null : index)}
                                  className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:ring-2 hover:ring-cyan-500 cursor-pointer"
                                >
                                  {renderIcon(c.icon)}
                                </button>
                                
                                {activeIconPicker === index && (
                                  <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl p-3 w-64 animate-in fade-in zoom-in-95">
                                    <div className="text-xs font-bold text-zinc-500 mb-2 uppercase">Select Icon</div>
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                      {PRESET_ICONS.map(iconName => {
                                        const IconC = IconMap[iconName];
                                        return (
                                          <button 
                                            key={iconName}
                                            onClick={() => { updateItem(index, 'icon', iconName); setActiveIconPicker(null); }}
                                            className={`p-1.5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors flex items-center justify-center ${c.icon === iconName ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600' : 'text-zinc-500 dark:text-zinc-400'}`}
                                          >
                                            <IconC className="w-5 h-5" />
                                          </button>
                                        )
                                      })}
                                    </div>
                                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
                                      <label className="flex items-center justify-center gap-2 w-full p-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-cyan-500 hover:text-cyan-500 cursor-pointer text-xs font-medium text-zinc-500 dark:text-zinc-400 transition-colors">
                                        <Upload className="w-3 h-3" />
                                        Upload Custom
                                        <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/png, image/jpeg, image/svg+xml"
                                          onChange={(e) => handleFileUpload(e, index)}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                        )}
                     </div>
                  </div>

                  {/* Content Column (Title & Checkbox) */}
                  <div className="flex-1 space-y-2 pt-1">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={c.title}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      />
                    ) : (
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                        {c.title}
                      </h3>
                    )}
                    
                    {isEditing ? (
                       <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={c.isMandatory || false}
                            onChange={(e) => updateItem(index, 'isMandatory', e.target.checked)}
                            className="rounded border-zinc-300 text-rose-500 focus:ring-rose-500"
                          />
                          Mandatory Requirement
                       </label>
                    ) : c.isMandatory && (
                      <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wide">Required</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Weight Column */}
              <div className="col-span-1 md:col-span-1 flex flex-row md:flex-col md:items-center gap-2">
                <div className="md:hidden text-xs font-bold text-zinc-500 uppercase tracking-wider">Weight:</div>
                 {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={c.weight}
                        onChange={(e) => updateItem(index, 'weight', parseInt(e.target.value) || 0)}
                        className="w-16 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-center font-mono font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      />
                      <span className="text-zinc-500">%</span>
                    </div>
                 ) : (
                    <div className="font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200 group relative cursor-help w-fit">
                      {c.weight}%
                      {/* Tooltip for Row Weight */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 p-2 bg-zinc-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-medium border border-zinc-700">
                        Contributes {c.weight}% to total risk score
                      </div>
                    </div>
                 )}
              </div>

              {/* Description Column */}
              <div className="col-span-1 md:col-span-4">
                <div className="md:hidden text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Description</div>
                 {isEditing ? (
                    <textarea 
                      value={c.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full h-24 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                 ) : (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                      {c.description}
                    </p>
                 )}
              </div>

              {/* Options Column (Read-only for now to keep UI clean, can be expanded later) */}
              <div className="col-span-1 md:col-span-4">
                 <div className="md:hidden text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Available Options</div>
                 <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    {c.options.map((opt, i) => {
                      const styles = getOptionStyles(opt.score);
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${styles.container}`}
                        >
                          <div className="flex items-center gap-2">
                            {styles.star ? styles.star : <div className="w-3 h-3" />}
                            <span className="font-semibold">{opt.label}</span>
                          </div>
                          <span className="font-mono font-bold">{opt.score}</span>
                        </div>
                      );
                    })}
                 </div>
              </div>

            </div>
          ))}
          
          {/* Add New Button */}
          {isEditing && (
            <div className="p-4 flex justify-center bg-zinc-50 dark:bg-zinc-900/20 last:rounded-b-[15px]">
               <button 
                onClick={addNewItem}
                className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-xl transition-all w-full justify-center font-bold"
               >
                 <Plus className="w-5 h-5" />
                 Add New Security Criterion
               </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
             <span className="text-zinc-500 text-xs uppercase font-bold">Total Criteria</span>
             <span className="text-xl font-mono text-zinc-900 dark:text-white font-bold">{items.length}</span>
          </div>
           <div className={`bg-white dark:bg-zinc-900/50 border p-4 rounded-xl flex items-center justify-between shadow-sm transition-colors ${isWeightValid ? 'border-zinc-200 dark:border-zinc-800' : 'border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-900/20'}`}>
             <span className={`text-xs uppercase font-bold ${isWeightValid ? 'text-zinc-500' : 'text-rose-600 dark:text-rose-400'}`}>Total Weight</span>
             <span className={`text-xl font-mono font-bold ${isWeightValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
               {totalWeight}%
             </span>
          </div>
      </div>
    </div>
  );
};

export default PolicyConfig;