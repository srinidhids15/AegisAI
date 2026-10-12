import React from 'react';
import { Card } from '../components/ui/Card';
import { Shield, Target, AlertTriangle, Fingerprint, ExternalLink } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <Card className="flex items-center gap-6 relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className={`p-4 rounded-xl ${color} bg-opacity-20 flex items-center justify-center border border-white/5`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="relative z-10">
      <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
  console.log("Dashboard rendering...");
  
  const handleResetCamera = () => {
    window.dispatchEvent(new CustomEvent('reset-camera'));
  };

  return (
    <div className="space-y-8 relative">
      
      <div className="relative h-64 rounded-3xl overflow-hidden mb-12 flex items-center px-12 border border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Security Ecosystem <span className="text-primary-custom underline decoration-primary-custom/40 underline-offset-8">Insight</span>
          </h1>
          <p className="text-text-secondary mt-4 text-lg leading-relaxed">
            AegisAI identifies and prioritizes exploit chains in real-time, 
            protecting your enterprise from advanced architectural threats.
          </p>
          <button 
            onClick={handleResetCamera}
            className="mt-6 text-[10px] uppercase tracking-widest font-bold text-primary-custom border border-primary-custom/30 px-3 py-1 rounded-full hover:bg-primary-custom/10 transition-all"
          >
            Reset View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Critical Paths" 
          value="12" 
          icon={Target} 
          color="bg-red-500" 
        />
        <StatCard 
          label="High Risks" 
          value="24" 
          icon={AlertTriangle} 
          color="bg-orange-500" 
        />
        <StatCard 
          label="MITRE Techniques" 
          value="18" 
          icon={Fingerprint} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Overall Coverage" 
          value="84%" 
          icon={Shield} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Interactive Attack Preview</h3>
            <button className="text-primary-custom text-sm flex items-center gap-2 hover:underline">
              View Full Graph <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 bg-background/50 rounded-2xl border border-dashed border-border-custom flex items-center justify-center text-text-secondary italic">
            [ Graph Visualization Context Here ]
          </div>
        </Card>

        <Card className="min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-8">Asset Exposure</h3>
          <div className="space-y-6">
            {[ 
              { name: 'auth_service', risk: 'High', color: 'text-orange-400' },
              { name: 'db_layer', risk: 'Critical', color: 'text-red-400' },
              { name: 'api_gateway', risk: 'Medium', color: 'text-yellow-400' },
              { name: 'user_management', risk: 'Low', color: 'text-blue-400' }
            ].map(asset => (
              <div key={asset.name} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border-custom">
                <span className="text-sm font-medium text-text-primary">{asset.name}</span>
                <span className={`text-[10px] font-bold uppercase ${asset.risk === 'Critical' ? 'text-secondary-custom' : asset.color}`}>{asset.risk}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
