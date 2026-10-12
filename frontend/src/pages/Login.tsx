import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { authService } from '../services/auth';
import { fadeInUp, staggerContainer } from '../animations/motionPresets';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background/20 overflow-hidden relative">
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 backdrop-blur-3xl border-white/10 shadow-2xl bg-black/40">
          <motion.div variants={fadeInUp} className="text-center space-y-3 mb-8">
            <div className="inline-flex w-14 h-14 bg-primary-custom/20 rounded-2xl items-center justify-center border border-primary-custom/30 mb-2">
              <ShieldCheck className="w-8 h-8 text-primary-custom" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AegisAI</h1>
            <p className="text-text-secondary">Enter your command center</p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeInUp} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary-custom transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-background/50 border border-border-custom rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-primary-custom/50 focus:ring-1 focus:ring-primary-custom/20 transition-all font-medium"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Access Phrase</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary-custom transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background/50 border border-border-custom rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-primary-custom/50 focus:ring-1 focus:ring-primary-custom/20 transition-all font-medium"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Authorize Access
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <p className="text-text-secondary text-sm">
              New operative?{' '}
              <Link to="/register" className="text-primary-custom font-bold hover:underline underline-offset-4">
                Request Clearance
              </Link>
            </p>
          </motion.div>
        </Card>
        
        <motion.p variants={fadeInUp} className="text-center mt-6 text-[10px] uppercase tracking-widest text-text-secondary opacity-40">
          Secure Multi-Channel Encrypted Protocol v2.4.0
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
