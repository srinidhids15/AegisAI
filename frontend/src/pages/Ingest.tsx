import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Upload, ArrowRight, ShieldAlert, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ingestionService } from '../services/ingestion';
import { fadeInUp } from '../animations/motionPresets';

const Ingest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'git' | 'zip'>('git');
  const [repoUrl, setRepoUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleGitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || !projectName) return;
    
    setIsIngesting(true);
    setResult(null);
    try {
      await ingestionService.ingestGit(repoUrl, projectName);
      setResult({ type: 'success', message: `Analysis initialized for project ID: sync. Vulnerability mapping in progress.` });
      setRepoUrl('');
      setProjectName('');
    } catch (err: any) {
      setResult({ type: 'error', message: err.response?.data?.detail || 'Ingestion failed. Ensure Git URL is accessible.' });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !projectName) return;
    
    setIsIngesting(true);
    setResult(null);
    try {
      await ingestionService.ingestZip(file, projectName);
      setResult({ type: 'success', message: `ZIP Ingestion successful. Project ${projectName} is being indexed.` });
      setFile(null);
      setProjectName('');
    } catch (err: any) {
      setResult({ type: 'error', message: err.response?.data?.detail || 'ZIP Processing failed. Ensure file is not corrupt.' });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <h1 className="text-3xl font-bold text-white tracking-tight">Source Ingestion</h1>
        <p className="text-text-secondary mt-1">Initialize intelligence mapping by connecting your codebase</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-1 overflow-hidden">
            <div className="flex bg-background/50 p-1 rounded-lg mb-6">
              <button 
                onClick={() => setActiveTab('git')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all font-bold text-sm ${activeTab === 'git' ? 'bg-primary-custom text-white shadow-lg shadow-primary-custom/20' : 'text-text-secondary hover:text-white'}`}
              >
                <GitBranch className="w-4 h-4" /> Git Repository
              </button>
              <button 
                onClick={() => setActiveTab('zip')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all font-bold text-sm ${activeTab === 'zip' ? 'bg-primary-custom text-white shadow-lg shadow-primary-custom/20' : 'text-text-secondary hover:text-white'}`}
              >
                <Upload className="w-4 h-4" /> Local Archive
              </button>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {activeTab === 'git' ? (
                  <motion.form 
                    key="git-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleGitSubmit} 
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Project Identifier</label>
                        <input 
                          type="text" 
                          required
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="e.g. Athena Microservice"
                          className="w-full bg-background/50 border border-border-custom rounded-xl px-4 py-3 text-white outline-none focus:border-primary-custom/50 focus:ring-1 focus:ring-primary-custom/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Repository URL (Public)</label>
                        <input 
                          type="url" 
                          required
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="https://github.com/org/repo"
                          className="w-full bg-background/50 border border-border-custom rounded-xl px-4 py-3 text-white outline-none focus:border-primary-custom/50 focus:ring-1 focus:ring-primary-custom/20 transition-all font-mono text-sm"
                        />
                      </div>
                    </div>
                    <Button 
                      disabled={isIngesting}
                      className="w-full py-4 font-bold flex items-center justify-center gap-2 group"
                    >
                      {isIngesting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>Initialize Neural Scan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="zip-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={handleZipSubmit} 
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Project Identifier</label>
                        <input 
                          type="text" 
                          required
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="e.g. Legacy Kernel ZIP"
                          className="w-full bg-background/50 border border-border-custom rounded-xl px-4 py-3 text-white outline-none focus:border-primary-custom/50 focus:ring-1 focus:ring-primary-custom/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Source Archive (.zip)</label>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-primary-custom/30 transition-colors cursor-pointer text-center group">
                          <input 
                            type="file" 
                            accept=".zip"
                            className="hidden" 
                            id="zip-upload"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                          <label htmlFor="zip-upload" className="cursor-pointer">
                            <Upload className="w-10 h-10 text-white/20 mx-auto mb-3 group-hover:text-primary-custom/50 transition-colors" />
                            <p className="text-sm font-bold text-white/60">
                              {file ? file.name : 'Click to select or drag & drop'}
                            </p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Max file size: 50MB</p>
                          </label>
                        </div>
                      </div>
                    </div>
                    <Button 
                      disabled={isIngesting || !file}
                      className="w-full py-4 font-bold flex items-center justify-center gap-2 group"
                    >
                      {isIngesting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>Upload & Analyze <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-xl border flex gap-4 ${result.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
            >
              {result.type === 'success' ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest">Protocol {result.type === 'success' ? 'Initiated' : 'Failure'}</h4>
                <p className="text-sm mt-1 opacity-80">{result.message}</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-primary-custom/[0.02] border-primary-custom/20">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-primary-custom" /> Analysis Protocol
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { title: 'Static Mapping', desc: 'Neural scanning for hardcoded secrets and logic flaws.' },
                { title: 'Path Traversal', desc: 'Predicting exploit chains via graph-based simulation.' },
                { title: 'MITRE Alignment', desc: 'Mapping discoveries to adversarial TTPs.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-custom mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-white/90">{item.title}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Ingest;
