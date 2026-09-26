import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Sparkles, Shield, AlertCircle, Building2, User, Wrench } from 'lucide-react';

type DemoRole = 'citizen' | 'authority' | 'dept_head' | 'worker';

const DEMO_CREDS: Record<DemoRole, { id: string; pw: string; label: string; icon: React.ReactNode; color: string }> = {
  citizen:   { id: 'citizen@urbanfix.in',   pw: 'UrbanFix@123', label: 'Citizen',          icon: <User className="w-4 h-4" />,      color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  authority: { id: 'authority@urbanfix.in', pw: 'UrbanFix@123', label: 'Authority',         icon: <Building2 className="w-4 h-4" />, color: 'bg-blue-50 border-blue-200 text-blue-800' },
  dept_head: { id: 'roads@urbanfix.in',     pw: 'UrbanFix@123', label: 'Dept. Head',        icon: <Shield className="w-4 h-4" />,    color: 'bg-amber-50 border-amber-200 text-amber-800' },
  worker:    { id: 'worker@urbanfix.in',    pw: 'UrbanFix@123', label: 'Field Worker',      icon: <Wrench className="w-4 h-4" />,    color: 'bg-purple-50 border-purple-200 text-purple-800' },
};

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('citizen@urbanfix.in');
  const [password, setPassword] = useState('UrbanFix@123');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillRole = (role: DemoRole) => {
    setIdentifier(DEMO_CREDS[role].id);
    setPassword(DEMO_CREDS[role].pw);
    setFormError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!identifier || !password) {
      setFormError('Please enter your email/mobile and password.');
      return;
    }
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <header className="bg-[#173B57] text-white px-6 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#246B8E] flex items-center justify-center font-bold text-lg">UF</div>
          <div>
            <h1 className="font-bold text-base leading-tight">THE URBAN FIX</h1>
            <p className="text-[11px] text-slate-300">National Municipal Redressal and Intelligent Triage Network</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          {/* Demo role selector */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <p className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Credentials</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_CREDS) as DemoRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillRole(role)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition ${DEMO_CREDS[role].color}`}
                >
                  {DEMO_CREDS[role].icon}
                  <span>{DEMO_CREDS[role].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Login form */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-[#173B57] px-8 py-5">
              <Lock className="w-7 h-7 text-[#5BBAD5] mb-2" />
              <h2 className="text-lg font-bold text-white">Sign In</h2>
              <p className="text-xs text-slate-300">Access your UrbanFix portal</p>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email or Mobile</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#173B57]/20"
                  placeholder="citizen@urbanfix.in"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#173B57]/20"
                  placeholder="UrbanFix@123"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#173B57] hover:bg-[#1e4d73] text-white rounded-lg font-semibold text-sm shadow-md cursor-pointer disabled:opacity-60 transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-xs text-slate-500">
                New citizen?{' '}
                <Link to="/register" className="text-[#246B8E] font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Login;
