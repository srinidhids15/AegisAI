import React from 'react';
import { Card } from '../components/ui/Card';

const tactics = [
  'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 
  'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement'
];

const MitreView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">MITRE ATT&CK Matrix</h1>
        <p className="text-text-secondary text-sm">Technique coverage and exploit capability mapping</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {tactics.map(tactic => (
          <div key={tactic} className="space-y-3">
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-2">{tactic}</h3>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`
                    p-3 rounded-lg border text-[10px] font-medium transition-all cursor-pointer
                    ${i === 1 && tactic === 'Execution' 
                      ? 'bg-primary-custom/10 border-primary-custom text-primary-custom' 
                      : 'bg-surface border-border-custom text-text-secondary hover:border-text-secondary/30'}
                  `}
                >
                  T{1000 + i + tactics.indexOf(tactic) * 10} Technique Name
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <Card className="p-6 border-primary-custom/20 bg-primary-custom/5">
        <h4 className="text-sm font-bold text-primary-custom mb-2">Coverage Summary</h4>
        <p className="text-sm text-text-secondary">
          Your current security architecture covers <span className="text-white font-bold">14%</span> of the MITRE ATT&CK matrix. 
          Focus on <span className="text-white">Lateral Movement</span> to improve ecosystem resilience.
        </p>
      </Card>
    </div>
  );
};

export default MitreView;
