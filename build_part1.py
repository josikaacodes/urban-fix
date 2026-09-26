import os

SRC = 'C:/Users/VAP/.gemini/antigravity/scratch/urbanfix/frontend/src'

def save(rel, txt):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(txt.strip() + '\n')
    print('Wrote:', rel)

REGISTER_TSX = r"""import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Phone, Mail, User, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const CHENNAI_WARDS = [
  'Ward 1 (Tondiarpet)', 'Ward 2 (Royapuram)', 'Ward 3 (Thiru Vi Ka Nagar)',
  'Ward 4 (Anna Nagar)', 'Ward 5 (Ambattur)', 'Ward 6 (Kodambakkam)',
  'Ward 7 (Valasaravakkam)', 'Ward 8 (Alandur)', 'Ward 9 (Adyar)',
  'Ward 10 (T Nagar / Kodambakkam)', 'Ward 11 (Perungudi)', 'Ward 12 (Sholinganallur)',
  'Ward 13 (Velachery)', 'Ward 14 (Porur)', 'Ward 15 (Tambaram)'
];

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '+91 ',
    password: '',
    city: 'Chennai',
    ward: 'Ward 10 (T Nagar / Kodambakkam)',
  });

  const [mobileOtp, setMobileOtp] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError('Please fill all required fields');
      return;
    }
    setStep(2);
    setMobileOtp('123456');
  };

  const handleVerifyMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mobileOtp !== '123456') {
      setError('Invalid OTP. Use demo OTP: 123456');
      return;
    }
    setStep(3);
  };

  const handleAadhaarVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarNumber) {
      setError('Please enter Aadhaar number');
      return;
    }
    setAadhaarVerified(true);
    setSuccessMsg('DigiLocker Identity Verified! (+25 Trust Score)');
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await register({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        city: formData.city,
        ward: formData.ward,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col justify-between">
      <header className="bg-[#173B57] text-white px-6 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#246B8E] flex items-center justify-center font-bold text-xl text-white">UF</div>
            <div>
              <h1 className="font-bold text-lg">URBANFIX CITIZEN PORTAL</h1>
              <p className="text-xs text-slate-300">Citizen Registration & DigiLocker Verification</p>
            </div>
          </div>
          <Link to="/login" className="text-xs text-slate-200 hover:text-white underline">Back to Sign In</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ramesh Krishnan" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Mobile No</label>
                    <input type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="ramesh@gmail.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Choose a password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm" required />
                </div>
                <button type="submit" className="w-full py-3 bg-[#173B57] text-white rounded-lg font-semibold text-sm cursor-pointer">
                Proceed to Verification
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyMobile} className="space-y-4">
                <div className="text-center">
                  <Phone className="w-12 h-12 text-[#246B8E] mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">Verify Mobile Number</h3>
                  <p className="text-xs text-slate-500">Enter demo OTP (123456)</p>
                </div>
                <input type="text" value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value)} maxLength={6} className="w-full py-2.5 border border-slate-300 rounded-lg text-center tracking-widest font-mono text-lg" required />
                <button type="submit" className="w-full py-3 bg-[#24875D] text-white rounded-lg font-semibold text-sm cursor-pointer">Verify & Continue</button>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700">
                  <Shield className="w-5 h-5 text-blue-600 mb-1" />
                  <strong>DigiLocker Trust Verification (optional)</strong>
                  <p className="mt-1">Linking your Aadhaar adds +25 to your Civic Trust Score.</p>
                </div>
                <input type="text" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} placeholder="XXXX XXXX 4821" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-xs font-mono" />
                <button type="button" onClick={handleAadhaarVerify} className="w-full py-2 bg-[#246B8E] text-white rounded-lg text-xs font-semibold">Verify via DigiLocker</button>
                <button type="button" onClick={handleFinalSubmit} disabled={loading} className="w-full py-3 bg-[#173B57] text-white rounded-lg font-semibold text-sm shadow-md cursor-pointer">Complete Registration</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default Register;"""
save('pages/Register.tsx', REGISTER_TSX)
