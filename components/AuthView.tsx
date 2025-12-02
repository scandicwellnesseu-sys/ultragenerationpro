
import React, { useState } from 'react';
import { LogoIcon } from './Icons';
import { useTranslations } from '../lib/i18n';
import Spinner from './Spinner';
import handler from '../functions/generate'; // Import the handler directly

interface AuthViewProps {
  onAuthSuccess: (token: string) => void;
}

type AuthState = 'login' | 'register' | 'forgotPassword' | 'forgotPasswordConfirmation';

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const action = authState === 'login' ? 'loginUser' : 'registerUser';
    const payload = authState === 'login' ? { email, password } : { name, email, password };

    try {
        const mockRequest = new Request('http://localhost/functions/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload })
        });

        const response = await handler(mockRequest);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed.');
        }
        
        onAuthSuccess(data.token);

    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const mockRequest = new Request('http://localhost/functions/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'forgotPassword', payload: { email } })
        });
        await handler(mockRequest);
        setAuthState('forgotPasswordConfirmation');
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const renderContent = () => {
    switch (authState) {
        case 'forgotPassword':
            return (
                <>
                    <h2 className="mt-6 text-3xl font-extrabold text-white">{t.forgotPassword}</h2>
                    <p className="mt-2 text-sm text-gray-400">{t.forgotPasswordInstructions}</p>
                    <form className="mt-8 space-y-6" onSubmit={handleForgotSubmit}>
                        <div>
                            <label htmlFor="email-address" className="sr-only">{t.emailAddress}</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" placeholder={t.emailAddress} />
                        </div>
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 gold-gradient disabled:opacity-50">
                                {loading ? <Spinner /> : t.sendResetLink}
                            </button>
                        </div>
                    </form>
                    <div className="text-sm text-center mt-4">
                        <button onClick={() => setAuthState('login')} className="font-medium text-yellow-400 hover:text-yellow-300">{t.backToLogin}</button>
                    </div>
                </>
            );
        case 'forgotPasswordConfirmation':
            return (
                <>
                    <h2 className="mt-6 text-3xl font-extrabold text-white">{t.resetLinkSent}</h2>
                    <p className="mt-2 text-sm text-gray-400">{t.resetLinkSentInstructions}</p>
                    <div className="text-sm text-center mt-6">
                        <button onClick={() => setAuthState('login')} className="font-medium text-yellow-400 hover:text-yellow-300">{t.backToLogin}</button>
                    </div>
                </>
            );
        default: // login and register
            const isLogin = authState === 'login';
            return (
                <>
                    <h2 className="mt-6 text-3xl font-extrabold text-white">{isLogin ? t.signIn : t.createAccount}</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {isLogin ? (<>{t.or} <button onClick={() => setAuthState('register')} className="font-medium text-yellow-400 hover:text-yellow-300">{t.startFreeTrial}</button></>) 
                               : (<>{t.alreadyHaveAccount} <button onClick={() => setAuthState('login')} className="font-medium text-yellow-400 hover:text-yellow-300">{t.signIn}</button></>)}
                    </p>
                    <form className="mt-8 space-y-6" onSubmit={handleAuthSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            {!isLogin && (
                                <div>
                                    <label htmlFor="name" className="sr-only">{t.yourName}</label>
                                    <input id="name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm" placeholder={t.yourName} />
                                </div>
                            )}
                            <div>
                                <label htmlFor="email-address" className="sr-only">{t.emailAddress}</label>
                                <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm`} placeholder={t.emailAddress} />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">{t.password}</label>
                                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm" placeholder={t.password} />
                            </div>
                        </div>
                        {isLogin && (
                            <div className="text-sm text-right">
                                <button onClick={() => setAuthState('forgotPassword')} className="font-medium text-yellow-400 hover:text-yellow-300">{t.forgotPassword}</button>
                            </div>
                        )}
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 gold-gradient disabled:opacity-50">
                                {loading ? <Spinner /> : (isLogin ? t.signIn : t.createAndStart)}
                            </button>
                        </div>
                    </form>
                </>
            );
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
        <div className="text-center">
          <LogoIcon className="h-12 w-12 text-yellow-400 mx-auto" />
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
