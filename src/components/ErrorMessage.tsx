import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-900/20 border border-red-600/30 p-4 mb-6 relative">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <p className="text-red-200 text-sm">{message}</p>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;