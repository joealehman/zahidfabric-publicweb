import { useState } from 'react';
import { Store, Lock, AlertCircle } from 'lucide-react';
import { DEMO_CREDENTIALS, type Role } from '@/lib/types';
import type { BusinessConfig } from '@/config/business';

export function LoginScreen({ onLogin, businessConfig }: { onLogin: (role: Role, name: string) => void; businessConfig: BusinessConfig }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const match = DEMO_CREDENTIALS.find((c) => c.username === username.trim().toLowerCase() && c.password === password);
      if (match) {
        onLogin(match.role, match.name);
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="login-shell flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-5 flex items-center justify-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center bg-[#1a2238] text-white"><Store size={20} /></span>
            <span className="text-xl font-semibold tracking-tight text-[#1a2238]">{businessConfig.businessName}</span>
          </div>
          <p className="eyebrow text-[#8a948e]">Staff Portal</p>
        </div>

        <div className="login-card bg-white border border-[#e0e5df] p-8">
          <h1 className="text-lg font-semibold text-[#1a2238]">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-[#8a948e]">Authorised staff only</p>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
                className="admin-input mt-2 w-full"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7b877f]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input mt-2 w-full"
                placeholder="Enter password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#68726e]">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 border-[#d4dbd5]" />
                Remember this device
              </label>
              <button type="button" className="text-sm text-[#557064] hover:text-[#1a2238]">Forgot password?</button>
            </div>

            {error && (
              <div className="flex items-center gap-2 border border-[#f8e4e1] bg-[#fdf6f5] px-3 py-2.5 text-sm text-[#9c473d]">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a2238] py-3 text-sm font-semibold text-white transition hover:bg-[#2a3550] disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#eef1ed] pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8a948e]">Demo accounts</p>
            <div className="space-y-1.5 text-xs text-[#68726e]">
              <button onClick={() => { setUsername('owner'); setPassword('owner'); }} className="flex w-full items-center justify-between hover:text-[#1a2238]">
                <span>Owner</span><span className="font-mono">owner / owner</span>
              </button>
              <button onClick={() => { setUsername('sara'); setPassword('sara'); }} className="flex w-full items-center justify-between hover:text-[#1a2238]">
                <span>Manager</span><span className="font-mono">sara / sara</span>
              </button>
              <button onClick={() => { setUsername('ali'); setPassword('ali'); }} className="flex w-full items-center justify-between hover:text-[#1a2238]">
                <span>Cashier</span><span className="font-mono">ali / ali</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-[#8a948e]">
          <Lock size={12} /> Protected business system — unauthorised access is logged
        </p>
      </div>
    </div>
  );
}
