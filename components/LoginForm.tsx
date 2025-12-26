import React, { useState } from 'react';
import Button from './Button';
import { Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check for demo purposes
    if (password === 'Hariprabodham369') {
      onLogin();
    } else {
      setError('Invalid Access Code');
      setPassword('');
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl max-w-md mx-auto mt-10 animate-fade-in">
        <div className="flex flex-col items-center mb-6 text-center">
            <div className="p-4 bg-indigo-500/20 rounded-full mb-4 ring-1 ring-indigo-500/40">
                <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Coordinator Access</h2>
            <p className="text-slate-400 text-sm mt-2">Enter authorization code to log race times.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                    placeholder="Enter Access Code"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center tracking-widest text-lg"
                    autoFocus
                />
                {error && (
                    <div className="flex items-center justify-center gap-2 text-red-400 text-sm animate-pulse">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1">
                    Unlock Console
                </Button>
            </div>
        </form>
    </div>
  );
};

export default LoginForm;