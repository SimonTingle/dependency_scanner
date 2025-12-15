'use client';
import { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * 🚀 THE MOTHERLODE DATA STRUCTURE
 * NOTE: The 'id' now represents a likely GitHub Owner/Repo combination for the scanner.
 */
const FILTER_DATA = {
  ecosystems: [
    { id: 'js', label: 'JavaScript / Node.js' },
    { id: 'py', label: 'Python' },
    { id: 'go', label: 'GoLang' },
    { id: 'rust', label: 'Rust' },
  ],
  categories: {
    js: [
      { id: 'frontend', label: 'Frontend Frameworks' },
      { id: 'backend', label: 'Backend (Node)' },
    ],
    py: [
      { id: 'data', label: 'Data Science / AI' },
      { id: 'web', label: 'Web Development' },
    ],
    go: [
      { id: 'micro', label: 'Microservices' },
      { id: 'cli', label: 'CLI Tools' },
    ],
    rust: [
      { id: 'sys', label: 'Systems Programming' },
      { id: 'wasm', label: 'WebAssembly' },
    ]
  },
  targets: {
    // JS
    frontend: [
      { id: 'facebook/react', label: 'React.js' },
      { id: 'vuejs/core', label: 'Vue.js' },
      { id: 'vercel/next.js', label: 'Next.js' },
      { id: 'angular/angular', label: 'Angular' },
    ],
    backend: [
      { id: 'expressjs/express', label: 'Express.js' },
      { id: 'nestjs/nest', label: 'NestJS' },
    ],
    // Python
    data: [
      { id: 'pandas-dev/pandas', label: 'Pandas' },
      { id: 'numpy/numpy', label: 'NumPy' },
      { id: 'pytorch/pytorch', label: 'PyTorch' },
    ],
    web: [
      { id: 'django/django', label: 'Django' },
      { id: 'pallets/flask', label: 'Flask' },
    ],
    // Go
    micro: [
      { id: 'gin-gonic/gin', label: 'Gin' },
      { id: 'gofiber/fiber', label: 'Fiber' },
    ],
    cli: [
      { id: 'spf13/cobra', label: 'Cobra' },
    ],
    // Rust
    sys: [
      { id: 'tokio-rs/tokio', label: 'Tokio' },
    ],
    wasm: [
      { id: 'yewstack/yew', label: 'Yew' },
    ],
    // Fallback
    default: []
  }
};

export default function SmartFilter({ onScan }: { onScan: (repo: string) => void }) {
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  const availableCategories = useMemo(() => {
    if (!selectedEcosystem) return [];
    // @ts-ignore
    return FILTER_DATA.categories[selectedEcosystem] || [];
  }, [selectedEcosystem]);

  const availableTargets = useMemo(() => {
    if (!selectedCategory) return [];
    // @ts-ignore
    return FILTER_DATA.targets[selectedCategory] || [];
  }, [selectedCategory]);

  const handleEcosystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEcosystem(e.target.value);
    setSelectedCategory('');
    setSelectedTarget('');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedTarget('');
  };

  const handleFinalScan = () => {
    if (selectedTarget) {
      onScan(selectedTarget);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-xl border border-gray-800 shadow-2xl w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6 text-blue-400">
        <Search className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-widest">Global Dependency Hunter</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DROPDOWNS */}
        {[
          { 
            label: "1. Ecosystem", 
            val: selectedEcosystem, 
            opts: FILTER_DATA.ecosystems, 
            fn: handleEcosystemChange, 
            dis: false 
          },
          { 
            label: "2. Domain", 
            val: selectedCategory, 
            opts: availableCategories, 
            fn: handleCategoryChange, 
            dis: !selectedEcosystem 
          },
          { 
            label: "3. Target Repo", 
            val: selectedTarget, 
            opts: availableTargets, 
            fn: (e: any) => setSelectedTarget(e.target.value), 
            dis: !selectedCategory 
          }
        ].map((item, idx) => (
          <div key={idx} className={`relative group ${item.dis ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{item.label}</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-gray-800 text-white border border-gray-700 hover:border-blue-500 px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                value={item.val}
                onChange={item.fn}
                disabled={item.dis}
              >
                <option value="">Select...</option>
                {item.opts.map((opt: any) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-4.5 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-8 transition-all duration-500 ${selectedTarget ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button 
          onClick={handleFinalScan}
          className="w-full py-4 rounded-xl font-bold text-lg shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform active:scale-[0.99] transition-all"
        >
          Initialize Trawl for {selectedTarget}
        </button>
      </div>
    </div>
  );
}
