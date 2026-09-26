import os

SRC = r'C:\Users\VAP\.gemini\antigravity\scratch\urbanfix\frontend\src'
 
def save(rel, text):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text.strip() + '\n')
    print('[SUCCESS] Wrote', rel)

LOGIN_TSX = '''import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, Mail, ArrowRight, CheckCircle2, AlertCircle, Building2, User, Wrench, Sparkles, Shield } from 'lucide-react';
import HackathonModal from '../components/HackathonModal';

const Login: React.FC = () => {
  const { login, error: authError, loading, isHackathonModalOpen, openHackathonModal, closeHackathonModal } = useAuth();
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('citizen@urbanfix.in');
  const [password, setPassword] = useState('UrbanFix@123');
  const [otpMobile, setOtpMobile] = useState('+91 9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [formError, setFormError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!identifier || !password) {
      setFormError('Please enter both identifier and password');
      return;
    }
    try {
      await login(identifier, password);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Invalid login credentials. Please try again.');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpMobile || otpMobile.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setOtpValue('123456');
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (otpValue !== '123456') {
      setFormError('Invalid OTP. Use demo OTP: 123456');
      return;
    }
    try {
      await login('citizen@urbanfix.in', 'UrbanFix@123');
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'OTP verification failed');
    }
  };

  const fillCredentials = (role: 'citizen' | 'authority' | 'dept_head' | 'worker') => {
    setLoginMode('password');
    if (role === 'citizen') {
      setIdentifier('citizen@urbanfix.in');
      setPassword('UrbanFix@123');
    } else if (role === 'authority') {
      setIdentifier('authority@urbanfix.in');
      setPassword('UrbanFix@123');
    } else if (role === 'dept_head') {
      setIdentifier('roads@urbanix.in');
      setPassword('UrbanFix@123');
    } else if (role === 'worker') {
      setIdentifier('worker@urbanfix.in');
      setPassword('UrbanFix@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col justify-between">
      <header className="bg-[#173B57] text-white border-b border-[#246B8E]/30 px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-leg bg-[#246B8E] flex items-center justify-center font-bold text-xl text-white shadow-inner">
              UF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold tracking-tight text-lg">URBANFIX</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#24875D] text-white">
                  Civic Intelligence System
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Greater Chennai Municipal Corporation • Citizen Incident Management
              </p>
            </div>
          </div>
          <button
            onClick={openHackathonModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#246B8E]/50 hover:bg-[#246B8E] text-xs font-semibold text-white transition border border-[#246B8E] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Judge / Demo Credentials</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-600 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>1-Click Prototype Role Login:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Pass: UrbanFix@123</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('citizen')}
                className="px-2 py-1.5 rounded bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 font-medium flex items-center justify-center space-x-1 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('authority')}
                className="px-2 py-1.5 rounded bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 font-medium flex items-center justify-center space-x-1 transition cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authority</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('dept_head')}
                className="px-2 py-1.5 rounded bg-white hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-700 font-medium flex items-center justify-center space-x-1 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Dept Head</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('worker')}
                className="px-2 py-1.5 rounded bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 hover:text-orange-700 font-medium flex items-center justify-center space-x-1 transition cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-orange-600" />
                <span>Worker</span>
              </button>
            </div>
          </div>

