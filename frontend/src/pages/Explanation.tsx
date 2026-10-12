import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sparkles, MessageSquare, ShieldCheck, Copy, Share2 } from 'lucide-react';

const ExplanationPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-custom/20 rounded-xl flex items-center justify-center border border-primary-custom/40">
            <Sparkles className="w-6 h-6 text-primary-custom" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Architectural AI Insights</h1>
            <p className="text-text-secondary text-sm">Automated explanation for identified exploit chains</p>
          </div>
        </div>
        
        <Badge variant="high">Risk Score: 7.8 / 10</Badge>
      </div>

      <Card className="p-8 space-y-8 border-primary-custom/20 bg-primary-custom/[0.02]">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary-custom">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Security Analyst Summary</h3>
          </div>
          <p className="text-text-primary leading-relaxed text-lg">
            "This attack path identifies a critical chain starting from a 
            <span className="text-white font-bold"> Public API Endpoint</span> 
            traversing through a <span className="text-primary-custom underline decoration-primary-custom/30 underline-offset-4">SQL Injection vulnerability</span> 
            and culminating in unauthorized access to the <code className="bg-surface px-1.5 py-0.5 rounded border border-border-custom text-orange-400">database.py</code> core asset.
            This represents a direct path to data exfiltration with high reliability."
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Remediation Steps
            </h4>
            <ul className="space-y-3">
              {[
                'Implement parameterized queries in Auth service',
                'Restrict filesystem access for API service user',
                'Rotate all database credentials immediately',
                'Add WAF rules to block boolean-based SQLi'
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="text-primary-custom font-bold">0{i+1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">Business Impact</h4>
            <div className="p-4 rounded-xl bg-surface/50 border border-border-custom space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Data Confidentiality</span>
                <span className="text-red-400 font-bold">CRITICAL</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[95%]" />
              </div>
              <p className="text-[10px] text-text-secondary italic">
                Regulatory fines (GDPR/CCPA) and loss of customer trust are likely if this exploit is executed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button className="btn-primary flex items-center gap-2 text-sm px-6">
            <Copy className="w-4 h-4" /> Copy Analysis
          </button>
          <button className="btn-outline flex items-center gap-2 text-sm px-6">
            <Share2 className="w-4 h-4" /> Share Report
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ExplanationPage;
