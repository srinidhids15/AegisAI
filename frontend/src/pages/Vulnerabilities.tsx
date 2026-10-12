import React, { useState, useEffect } from 'react';
import { analysisService, type Vulnerability } from '../services/analysis';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, Download, Loader2, ShieldAlert } from 'lucide-react';
import { fadeInUp } from '../animations/motionPresets';
import { motion } from 'framer-motion';

const Vulnerabilities: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const results = await analysisService.getResults(projectId);
        setVulnerabilities(results.vulnerabilities);
      } catch (err: any) {
        // If "default" doesn't exist yet, we just show empty or error
        if (err.response?.status === 404) {
          setVulnerabilities([]);
        } else {
          console.error("Failed to sync with neural engine. Ensure analyzer is online.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [projectId]);

  return (
    <div className="space-y-6">
      <motion.div 
        variants={fadeInUp} 
        initial="initial" 
        animate="animate"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vulnerability Inventory</h1>
          <p className="text-text-secondary text-sm">Review and manage detected architectural flaws</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2 text-sm px-4 py-2 border-white/10 hover:border-primary-custom/30 transition-all">
            <Filter className="w-4 h-4" /> Filter Protocols
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2 bg-primary-custom text-white font-bold rounded-lg shadow-lg shadow-primary-custom/20">
            <Download className="w-4 h-4" /> Export Intel
          </button>
        </div>
      </motion.div>

      <Card className="p-0 overflow-hidden border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary-custom transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by vulnerability name or file footprint..."
              className="w-full bg-background/50 border border-border-custom rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-custom/30 focus:ring-1 focus:ring-primary-custom/10 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary-custom animate-spin" />
              <p className="text-text-secondary text-sm animate-pulse tracking-widest uppercase font-bold">Resyncing with Neural Engine...</p>
            </div>
          ) : vulnerabilities.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                <ShieldAlert className="w-8 h-8 text-text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Threats Detected</h3>
                <p className="text-text-secondary text-sm max-w-xs mx-auto mt-1">Initialize a source ingestion or rescan the environment to trigger detection.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal">
              <thead className="bg-white/[0.02] text-text-secondary uppercase text-[10px] tracking-widest font-bold border-b border-white/5">
                <tr>
                  <th className="px-6 py-5">Vulnerability Node</th>
                  <th className="px-6 py-5">Asset / File Fingerprint</th>
                  <th className="px-6 py-5">Severity Level</th>
                  <th className="px-6 py-5">Terminal Reference</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vulnerabilities.map((v) => (
                  <tr key={v.id} className="hover:bg-primary-custom/5 transition-colors group">
                    <td className="px-6 py-5 font-bold text-white text-base">{v.type}</td>
                    <td className="px-6 py-5 text-text-secondary font-medium">{v.asset}</td>
                    <td className="px-6 py-5">
                      <Badge variant={v.severity as any}>{v.severity}</Badge>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-primary-custom/70">{v.lines}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-primary-custom font-bold text-xs uppercase tracking-widest hover:underline underline-offset-4 opacity-0 group-hover:opacity-100 transition-all">
                        Drill Down
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Vulnerabilities;
