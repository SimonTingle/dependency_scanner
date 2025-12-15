'use client';
import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Search, 
  Globe, 
  Server, 
  Smartphone, 
  Database, 
  Cpu, 
  Terminal, 
  Layers, 
  Briefcase,
  Code2
} from 'lucide-react';

/**
 * 🛡️ ROBUST DATA STRUCTURE
 * Every 'id' in categories must have a matching key in 'targets'.
 */
const FILTER_DATA = {
  ecosystems: [
    { id: 'web_frontend', label: 'Web Frontend', icon: Globe },
    { id: 'web_backend', label: 'Web Backend', icon: Server },
    { id: 'mobile', label: 'Mobile & App', icon: Smartphone },
    { id: 'ai_data', label: 'AI, Data & ML', icon: Database },
    { id: 'systems', label: 'Systems (Rust/Go/C++)', icon: Cpu },
    { id: 'devops', label: 'DevOps & Cloud', icon: Terminal },
    { id: 'blockchain', label: 'Web3 & Blockchain', icon: Layers },
    { id: 'enterprise', label: 'Enterprise (Java/C#)', icon: Briefcase },
    { id: 'languages', label: 'Programming Languages', icon: Code2 },
  ],
  categories: {
    web_frontend: [
      { id: 'react_eco', label: 'React Ecosystem' },
      { id: 'vue_eco', label: 'Vue Ecosystem' },
      { id: 'angular_eco', label: 'Angular Ecosystem' },
      { id: 'meta_frameworks', label: 'Meta Frameworks' },
      { id: 'css_ui', label: 'CSS & UI Libraries' },
    ],
    web_backend: [
      { id: 'node_frameworks', label: 'Node.js Frameworks' },
      { id: 'python_web', label: 'Python Web' },
      { id: 'php_frameworks', label: 'PHP / Laravel' },
      { id: 'ruby_web', label: 'Ruby on Rails' },
      { id: 'go_web', label: 'Go Web Servers' },
    ],
    mobile: [
      { id: 'cross_platform', label: 'Cross Platform' },
      { id: 'ios_native', label: 'iOS Native (Swift)' },
      { id: 'android_native', label: 'Android Native (Kotlin)' },
    ],
    ai_data: [
      { id: 'python_ml', label: 'Machine Learning (Python)' },
      { id: 'llms', label: 'LLMs & AI SDKs' },
      { id: 'data_eng', label: 'Data Engineering' },
    ],
    systems: [
      { id: 'rust_core', label: 'Rust Crates' },
      { id: 'go_cli', label: 'Go CLI Tools' },
      { id: 'cpp_libs', label: 'C++ Libraries' },
    ],
    devops: [
      { id: 'iac', label: 'Infrastructure as Code' },
      { id: 'containers', label: 'Containers & Orchestration' },
      { id: 'ci_cd', label: 'CI/CD Tools' },
      { id: 'monitoring', label: 'Monitoring & Observability' },
    ],
    blockchain: [
      { id: 'ethereum', label: 'Ethereum Ecosystem' },
      { id: 'solana', label: 'Solana Ecosystem' },
    ],
    enterprise: [
      { id: 'java_spring', label: 'Java Spring Boot' },
      { id: 'csharp_net', label: 'C# / .NET Core' },
    ],
    languages: [
      { id: 'typescript_core', label: 'TypeScript' },
      { id: 'python_core', label: 'Python Core' },
    ]
  },
  targets: {
    // --- WEB FRONTEND ---
    react_eco: [
      { id: 'facebook/react', label: 'React Core' },
      { id: 'reduxjs/redux', label: 'Redux' },
      { id: 'TanStack/query', label: 'TanStack Query' },
      { id: 'pmndrs/zustand', label: 'Zustand' },
    ],
    vue_eco: [
      { id: 'vuejs/core', label: 'Vue 3 Core' },
      { id: 'vuejs/router', label: 'Vue Router' },
      { id: 'vuejs/pinia', label: 'Pinia' },
    ],
    angular_eco: [
      { id: 'angular/angular', label: 'Angular Core' },
      { id: 'angular/components', label: 'Angular Material' },
    ],
    meta_frameworks: [
      { id: 'vercel/next.js', label: 'Next.js' },
      { id: 'nuxt/nuxt', label: 'Nuxt' },
      { id: 'remix-run/remix', label: 'Remix' },
      { id: 'withastro/astro', label: 'Astro' },
    ],
    css_ui: [
      { id: 'tailwindlabs/tailwindcss', label: 'Tailwind CSS' },
      { id: 'mui/material-ui', label: 'Material UI' },
      { id: 'shadcn-ui/ui', label: 'shadcn/ui' },
    ],

    // --- WEB BACKEND ---
    node_frameworks: [
      { id: 'expressjs/express', label: 'Express' },
      { id: 'nestjs/nest', label: 'NestJS' },
      { id: 'fastify/fastify', label: 'Fastify' },
    ],
    python_web: [
      { id: 'django/django', label: 'Django' },
      { id: 'pallets/flask', label: 'Flask' },
      { id: 'fastapi/fastapi', label: 'FastAPI' }, // Corrected owner
    ],
    php_frameworks: [
      { id: 'laravel/laravel', label: 'Laravel' },
      { id: 'symfony/symfony', label: 'Symfony' },
    ],
    ruby_web: [
      { id: 'rails/rails', label: 'Ruby on Rails' },
      { id: 'sinatra/sinatra', label: 'Sinatra' },
    ],
    go_web: [
      { id: 'gin-gonic/gin', label: 'Gin' },
      { id: 'gofiber/fiber', label: 'Fiber' },
    ],

    // --- MOBILE ---
    cross_platform: [
      { id: 'facebook/react-native', label: 'React Native' },
      { id: 'flutter/flutter', label: 'Flutter' },
      { id: 'ionic-team/ionic-framework', label: 'Ionic' },
    ],
    ios_native: [
      { id: 'Alamofire/Alamofire', label: 'Alamofire' },
      { id: 'Moya/Moya', label: 'Moya' },
    ],
    android_native: [
      { id: 'square/retrofit', label: 'Retrofit' },
      { id: 'square/okhttp', label: 'OkHttp' },
    ],

    // --- AI & DATA ---
    python_ml: [
      { id: 'pandas-dev/pandas', label: 'Pandas' },
      { id: 'numpy/numpy', label: 'NumPy' },
      { id: 'scikit-learn/scikit-learn', label: 'Scikit-Learn' },
      { id: 'pytorch/pytorch', label: 'PyTorch' },
      { id: 'huggingface/transformers', label: 'Transformers' },
    ],
    llms: [
      { id: 'langchain-ai/langchain', label: 'LangChain' },
      { id: 'openai/openai-python', label: 'OpenAI SDK' },
    ],
    data_eng: [
      { id: 'apache/airflow', label: 'Apache Airflow' },
      { id: 'dbt-labs/dbt-core', label: 'dbt Core' },
    ],

    // --- SYSTEMS ---
    rust_core: [
      { id: 'rust-lang/cargo', label: 'Cargo' },
      { id: 'tokio-rs/tokio', label: 'Tokio' },
      { id: 'serde-rs/serde', label: 'Serde' },
    ],
    go_cli: [
      { id: 'spf13/cobra', label: 'Cobra' },
      { id: 'charmbracelet/bubbletea', label: 'Bubbletea' },
    ],
    cpp_libs: [
      { id: 'nlohmann/json', label: 'JSON for Modern C++' },
      { id: 'ocornut/imgui', label: 'Dear ImGui' },
    ],

    // --- DEVOPS ---
    iac: [
      { id: 'hashicorp/terraform', label: 'Terraform' },
      { id: 'pulumi/pulumi', label: 'Pulumi' },
      { id: 'ansible/ansible', label: 'Ansible' },
    ],
    containers: [
      { id: 'moby/moby', label: 'Docker' },
      { id: 'kubernetes/kubernetes', label: 'Kubernetes' },
    ],
    ci_cd: [
      { id: 'jenkinsci/jenkins', label: 'Jenkins' },
      { id: 'gitlabhq/gitlabhq', label: 'GitLab' },
      { id: 'actions/runner', label: 'GitHub Actions Runner' },
    ],
    monitoring: [
      { id: 'prometheus/prometheus', label: 'Prometheus' },
      { id: 'grafana/grafana', label: 'Grafana' },
    ],

    // --- BLOCKCHAIN ---
    ethereum: [
      { id: 'ethereum/go-ethereum', label: 'Go Ethereum (Geth)' },
      { id: 'ethers-io/ethers.js', label: 'Ethers.js' },
    ],
    solana: [
      { id: 'solana-labs/solana', label: 'Solana' },
      { id: 'coral-xyz/anchor', label: 'Anchor' },
    ],

    // --- ENTERPRISE ---
    java_spring: [
      { id: 'spring-projects/spring-boot', label: 'Spring Boot' },
      { id: 'spring-projects/spring-framework', label: 'Spring Framework' },
    ],
    csharp_net: [
      { id: 'dotnet/aspnetcore', label: 'ASP.NET Core' },
      { id: 'dotnet/efcore', label: 'Entity Framework Core' },
    ],

    // --- LANGUAGES ---
    typescript_core: [
      { id: 'microsoft/typescript', label: 'TypeScript Compiler' },
    ],
    python_core: [
      { id: 'python/cpython', label: 'CPython' },
    ],

    // Fallback to prevent crashes if a key is missing
    default: []
  }
};

export default function SmartFilter({ onScan }: { onScan: (repo: string) => void }) {
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  // 1. Get Categories safely
  const availableCategories = useMemo(() => {
    if (!selectedEcosystem) return [];
    // Robust check: ensure key exists
    return (FILTER_DATA.categories as any)[selectedEcosystem] || [];
  }, [selectedEcosystem]);

  // 2. Get Targets safely
  const availableTargets = useMemo(() => {
    if (!selectedCategory) return [];
    
    // Robust check: Log warning if data is missing, but don't crash
    const targets = (FILTER_DATA.targets as any)[selectedCategory];
    if (!targets) {
      console.warn(`Missing targets for category ID: ${selectedCategory}`);
      return [];
    }
    return targets;
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
    if (selectedTarget) onScan(selectedTarget);
  };

  const CurrentIcon = useMemo(() => {
    const eco = FILTER_DATA.ecosystems.find(e => e.id === selectedEcosystem);
    return eco ? eco.icon : Search;
  }, [selectedEcosystem]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8 text-blue-400 border-b border-gray-800 pb-4">
        <CurrentIcon className="w-6 h-6" />
        <span className="text-sm font-bold uppercase tracking-widest">Global Dependency Hunter</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. ECOSYSTEM */}
        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Ecosystem</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-gray-800 text-white border border-gray-700 hover:border-blue-500 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
              value={selectedEcosystem}
              onChange={handleEcosystemChange}
            >
              <option value="">Select Ecosystem...</option>
              {FILTER_DATA.ecosystems.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-4.5 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* 2. DOMAIN */}
        <div className={`relative transition-all duration-300 ${!selectedEcosystem ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">2. Domain</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-gray-800 text-white border border-gray-700 hover:border-blue-500 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={!selectedEcosystem}
            >
              <option value="">
                {selectedEcosystem ? 'Select Domain...' : 'Waiting for Ecosystem...'}
              </option>
              {availableCategories.map((opt: any) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-4.5 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* 3. TARGET */}
        <div className={`relative transition-all duration-300 ${!selectedCategory ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">3. Target Repo</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-gray-800 text-white border border-gray-700 hover:border-blue-500 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              disabled={!selectedCategory || availableTargets.length === 0}
            >
              <option value="">
                {availableTargets.length === 0 && selectedCategory 
                  ? "No Presets Available" 
                  : selectedCategory 
                    ? "Select Target..." 
                    : "Waiting for Domain..."
                }
              </option>
              {availableTargets.map((opt: any) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-4.5 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* ACTION BAR */}
      <div className={`mt-8 transition-all duration-500 ${selectedTarget ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button 
          onClick={handleFinalScan}
          className="w-full py-5 rounded-xl font-bold text-lg shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform active:scale-[0.99] transition-all flex justify-center items-center gap-2"
        >
           <Search className="w-5 h-5" />
           Initialize Trawl for {selectedTarget}
        </button>
      </div>
    </div>
  );
}