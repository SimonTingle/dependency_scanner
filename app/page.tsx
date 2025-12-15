'use client';
import { useState, useEffect } from 'react';
import SmartFilter from './components/SmartFilter';
import ProgressBar from './components/ProgressBar';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [targetName, setTargetName] = useState('');

  // 🔄 Progress Bar Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Stall at 90% until real data arrives
          // Random increments to look organic
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 500);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading]);

  async function handleScan(repoString: string) {
    setLoading(true);
    setError('');
    setData(null);
    setTargetName(repoString);

    const [owner, repo] = repoString.split('/');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ owner, repo }),
      });
      const json = await res.json();
      
      if (json.error) throw new Error(json.error);
      setData(json.results);
      setProgress(100);
    } catch (e: any) {
      setError(e.message);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
          DepTrawl Intelligence
        </h1>

        <div className="mb-12">
          <SmartFilter onScan={handleScan} />
        </div>

        {loading && <ProgressBar progress={progress} />}

        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

        {data && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                Analysis Results for <span className="text-blue-400">{targetName}</span>
              </h2>
              <span className="bg-gray-800 px-3 py-1 rounded text-sm text-gray-400">
                {data.length} Updates Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((pkg) => (
                <div key={pkg.name} className="flex flex-col p-5 bg-gray-900/60 backdrop-blur rounded-lg border border-gray-800 hover:border-gray-600 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <a href={pkg.link} target="_blank" className="font-bold text-lg text-blue-400 hover:underline flex items-center gap-2">
                      {pkg.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </a>
                    {pkg.severity === 'Major' ? (
                      <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/20 uppercase tracking-wide">Major</span>
                    ) : (
                      <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-500/20 uppercase tracking-wide">Minor</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm font-mono">
                    <div className="bg-black/30 px-3 py-2 rounded text-gray-400">
                      v{pkg.current}
                    </div>
                    <div className="h-px flex-1 bg-gray-700"></div>
                    <div className="bg-green-900/20 px-3 py-2 rounded text-green-400 border border-green-900/50">
                      v{pkg.latest}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {data.length === 0 && (
              <div className="text-center p-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-xl text-green-400 font-bold">All clean! 🎉</p>
                <p className="text-gray-500 mt-2">No outdated dependencies found in the first 20 packages.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
