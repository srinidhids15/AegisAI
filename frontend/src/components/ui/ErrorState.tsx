import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "An unexpected error occurred while communicating with the security engine.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 glass rounded-3xl border-red-500/20 max-w-md mx-auto">
      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-white">Interface Sync Failure</h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="flex items-center gap-2 mt-2">
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </Button>
      )}
    </div>
  );
};
