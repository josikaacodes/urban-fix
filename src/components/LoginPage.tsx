import React, { useState, useEffect } from 'react';
import { AuthUser, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface LoginPageProps {
  onLoginOfficer: (user: AuthUser) => void;
  onLoginCitizen: (phone: string, ward: string) => void;
  onReturnHome: () => void;
  onToast: (msg: string) => void;
  initialRole?: 'citizen' | 'official';
  language?: Language;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginOfficer,
  onLoginCitizen,
  onReturnHome,
  onToast,
  initialRole = 'citizen',
  language = 'en',
}) => {
  const t = TRANSLATIONS[language];
  const [persona, setPersona] = useState<'citizen' | 'official'>(initialRole);

  // Citizen Mode State
  const [mobileNumber, setMobileNumber] = useState('9840124789');
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [verificationMode, setVerificationMode] = useState<'otp' | 'mpin'>('otp');
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9', '1', '0']);
  const [mpin, setMpin] = useState('4201');
  const [wardAddress, setWardAddress] = useState('Ward 42, Sector 4B, Chennai');
  const [otpCountdown, setOtpCountdown] = useState(45);
  const [isCountingDown, setIsCountingDown] = useState(true);

  // Official Mode State
  const [officerId, setOfficerId] = useState('ENG-GCC-W42');
  const [department, setDepartment] = useState('Public Works & Highways (GCC Works)');
  const [hsmPasscode, setHsmPasscode] = useState('GCC-SECURE-901');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountingDown && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    } else if (otpCountdown === 0) {
      setIsCountingDown(false);
    }
    return () => clearInterval(timer);
  }, [isCountingDown, otpCountdown]);

  // Mobile Validation (Indian 10-digit: ^[6-9]\d{9}$)
  const validateMobile = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(cleaned);
    const regex = /^[6-9]\d{9}$/;
    if (cleaned.length === 10 && !regex.test(cleaned)) {
      setMobileError('Mobile number must begin with 6, 7, 8, or 9.');
    } else if (cleaned.length > 0 && cleaned.length < 10) {
      setMobileError('Please enter full 10-digit mobile line.');
    } else {
      setMobileError(null);
    }
  };

  const handleAutoDetectGps = () => {
    setWardAddress('Ward 42, Sector 4B (13.0827° N, 80.2707° E)');
    onToast('GNSS location locked: Ward 42 Zonal Sector 4B (Chennai South)');
  };

  const handleAutoFillOtp = () => {
    setOtpDigits(['4', '8', '2', '9', '1', '0']);
    onToast('SMS OTP token auto-filled: 482910');
  };

  const handleResendOtp = () => {
    setOtpCountdown(45);
    setIsCountingDown(true);
    onToast('New 6-digit OTP code dispatched via cellular SMS gateway.');
  };

  // Demo Shortcuts
  const handleAutoFillDemo = () => {
    if (persona === 'citizen') {
      setMobileNumber('9840124789');
      setMobileError(null);
      setOtpDigits(['4', '8', '2', '9', '1', '0']);
      setWardAddress('Ward 42, Sector 4B, Chennai');
      onToast('Demo Citizen credentials loaded (+91 98401 24789).');
    } else {
      setOfficerId('ENG-GCC-W42');
      setDepartment('Public Works & Highways (GCC Works)');
      setHsmPasscode('GCC-SECURE-901');
      onToast('Demo Municipal Officer credentials loaded (Eng. R. Sundaram).');
    }
  };

  const handleInstantGuestAccess = () => {
    if (persona === 'citizen') {
      onToast('Instant Guest Session initialized: Resident Desk Ward 42.');
      onLoginCitizen('+91 98401 24789', 'Ward 42');
    } else {
      onToast('Instant Official Session initialized: Eng. R. Sundaram (GCC-W42-901).');
      onLoginOfficer({
        id: 'officer-1',
        name: 'Eng. R. Sundaram',
        role: 'nodal_officer',
        roleTitle: 'Zonal Nodal Engineer',
        badgeId: 'ENG-GCC-W42',
        ward: 'Ward 42 Zonal Office',
        email: 'r.sundaram@chennaicorporation.gov.in',
        avatarInitials: 'RS',
      });
    }
  };

  // Submit Handlers
  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setMobileError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    onToast(`Verified +91 ${mobileNumber}. Entering Citizen Resident Desk.`);
    onLoginCitizen(`+91 ${mobileNumber}`, wardAddress);
  };

  const handleOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onToast(`SSO Token Authenticated: ${officerId} (${department}).`);
    onLoginOfficer({
      id: 'officer-1',
      name: 'Eng. R. Sundaram',
      role: 'nodal_officer',
      roleTitle: 'Zonal Nodal Engineer',
      badgeId: officerId,
      ward: 'Ward 42 Zonal Office',
      email: 'r.sundaram@chennaicorporation.gov.in',
      avatarInitials: 'RS',
    });
  };

  return (
    <div className="min-h-screen bg-[#fdf9f0] text-[#1c1c16] flex flex-col justify-between font-body p-4 sm:p-6 civic-carto-grid selection:bg-[#c9e4cc] selection:text-[#4e6753]">
      {/* ================= HEADER ================= */}
      <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between pb-6">
        <button
          onClick={onReturnHome}
          className="text-xs font-mono text-[#4c6451] hover:text-[#051c11] flex items-center gap-1.5 transition-colors bg-white/80 px-3 py-1.5 rounded-lg border border-[#c2c8c2]/40 shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>{t.returnOverview}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c9e4cc]/60 text-[#092011] font-mono text-[10px] font-semibold border border-[#4c6451]/30">
            <span className="w-2 h-2 rounded-full bg-[#4c6451]"></span>
            <span>TLS 1.3 Certified Security Telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#1a3125] text-white flex items-center justify-center font-bold text-xs">
              <span className="material-symbols-outlined text-[16px]">shield</span>
            </div>
            <span className="font-headline font-bold text-sm text-[#051c11]">{t.brandName}</span>
          </div>
        </div>
      </div>

      {/* ================= CARD SHELL ================= */}
      <div className="max-w-lg w-full mx-auto bg-white rounded-3xl border border-[#c2c8c2]/50 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* BHARAT CIVIC § 19 Ordinance Badge */}
        <div className="flex items-center justify-between border-b border-[#ece8df] pb-3 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#f2ede4] text-[#4c6451] font-mono text-[10px] font-semibold border border-[#c2c8c2]/40">
            <span className="material-symbols-outlined text-[14px]">gavel</span>
            <span>BHARAT CIVIC § 19 ORDINANCE</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#4c6451]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4c6451] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a3125]"></span>
            </span>
            <span>Node Online</span>
          </div>
        </div>

        {/* Segmented Operational Persona Switcher */}
        <div className="flex items-center p-1 bg-[#f2ede4] rounded-xl border border-[#c2c8c2]/40 mb-6">
          <button
            type="button"
            onClick={() => setPersona('citizen')}
            className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              persona === 'citizen'
                ? 'bg-white text-[#051c11] shadow-xs font-bold'
                : 'text-[#424844] hover:text-[#051c11]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            Citizen Mode
          </button>
          <button
            type="button"
            onClick={() => setPersona('official')}
            className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              persona === 'official'
                ? 'bg-white text-[#051c11] shadow-xs font-bold'
                : 'text-[#424844] hover:text-[#051c11]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            Ward Official SSO
          </button>
        </div>

        {/* ================= PERSONA 1: CITIZEN MODE FORM ================= */}
        {persona === 'citizen' ? (
          <form onSubmit={handleCitizenSubmit} className="flex flex-col gap-4 text-xs font-body">
            <div>
              <h2 className="font-headline text-lg font-bold text-[#051c11]">
                Citizen Resident Intake &amp; Audit Gate
              </h2>
              <p className="font-body text-xs text-[#424844] mt-0.5">
                Verify mobile phone to log infrastructure complaints and provide authoritative 5-star repair sign-offs.
              </p>
            </div>

            {/* Mobile Line with Static +91 Prefix */}
            <div>
              <label className="block font-mono text-[11px] text-[#1c1c16] font-semibold mb-1">
                Indian Mobile Number
              </label>
              <div className="flex items-center rounded-lg bg-[#f7f3ea] border border-[#c2c8c2]/50 overflow-hidden focus-within:border-[#051c11] focus-within:ring-1 focus-within:ring-[#051c11]">
                <span className="px-3 py-2 bg-[#ece8df] border-r border-[#c2c8c2]/40 font-mono text-xs font-bold text-[#051c11] select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => validateMobile(e.target.value)}
                  placeholder="98401 24789"
                  className="w-full px-3 py-2 bg-transparent font-mono text-xs text-[#1c1c16] focus:outline-none"
                />
              </div>
              {mobileError && (
                <span className="text-[11px] font-mono text-[#ba1a1a] mt-1 block">
                  {mobileError}
                </span>
              )}
            </div>

            {/* Segmented Verification Mode Switcher */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] text-[#1c1c16] font-semibold">
                  Verification Protocol
                </label>
                <div className="inline-flex p-0.5 bg-[#f2ede4] rounded border border-[#c2c8c2]/40 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setVerificationMode('otp')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      verificationMode === 'otp' ? 'bg-white text-[#051c11] font-bold shadow-xs' : 'text-[#727973]'
                    }`}
                  >
                    6-Digit SMS OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationMode('mpin')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      verificationMode === 'mpin' ? 'bg-white text-[#051c11] font-bold shadow-xs' : 'text-[#727973]'
                    }`}
                  >
                    4-Digit MPIN
                  </button>
                </div>
              </div>

              {verificationMode === 'otp' ? (
                /* 6-Digit Spaced OTP Field */
                <div className="p-3 bg-[#f7f3ea] rounded-xl border border-[#c2c8c2]/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#424844]">One-Time Passcode</span>
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="text-[10px] font-mono text-[#4c6451] hover:underline font-semibold"
                    >
                      Auto-Fill OTP (482910)
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const newDigits = [...otpDigits];
                          newDigits[idx] = e.target.value;
                          setOtpDigits(newDigits);
                        }}
                        className="w-10 h-11 text-center bg-white border border-[#c2c8c2]/50 rounded-lg font-mono text-base font-bold text-[#051c11] focus:outline-none focus:border-[#051c11]"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#727973] pt-1">
                    <span>Carrier: BSNL / Jio Telecom Gateway</span>
                    {isCountingDown ? (
                      <span className="text-[#4c6451] font-bold">Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[#ba1a1a] hover:underline font-bold"
                      >
                        Resend OTP Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* 4-Digit Masked MPIN */
                <div className="p-3 bg-[#f7f3ea] rounded-xl border border-[#c2c8c2]/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#424844]">Registered 4-Digit MPIN</span>
                    <button
                      type="button"
                      onClick={() => onToast('Reset link dispatched to registered SIM line.')}
                      className="text-[10px] font-mono text-[#4c6451] hover:underline"
                    >
                      Forgot PIN?
                    </button>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={mpin}
                    onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full tracking-[1em] text-center bg-white border border-[#c2c8c2]/50 rounded-lg py-2 font-mono text-base font-bold text-[#051c11] focus:outline-none focus:border-[#051c11]"
                  />
                </div>
              )}
            </div>

            {/* Ward Jurisdiction with Auto-Detect GPS */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-[11px] text-[#1c1c16] font-semibold">
                  Ward Jurisdiction &amp; Primary Sector
                </label>
                <button
                  type="button"
                  onClick={handleAutoDetectGps}
                  className="text-[10px] font-mono text-[#4c6451] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[13px]">my_location</span>
                  Auto-Detect GPS
                </button>
              </div>
              <input
                type="text"
                required
                value={wardAddress}
                onChange={(e) => setWardAddress(e.target.value)}
                className="w-full p-2.5 bg-[#f7f3ea] border border-[#c2c8c2]/50 rounded-lg font-mono text-xs focus:outline-none focus:border-[#051c11]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1a3125] text-white rounded-xl font-mono text-xs font-semibold hover:bg-[#051c11] transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>Verify &amp; Enter Citizen Desk</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
        ) : (
          /* ================= PERSONA 2: WARD OFFICIAL SSO FORM ================= */
          <form onSubmit={handleOfficialSubmit} className="flex flex-col gap-4 text-xs font-body">
            <div>
              <h2 className="font-headline text-lg font-bold text-[#051c11]">
                Municipal Authority SSO Authentication
              </h2>
              <p className="font-body text-xs text-[#424844] mt-0.5">
                Restricted to authorized civil engineers, zonal commissioners, and dispatch supervisors.
              </p>
            </div>

            {/* Officer Service ID */}
            <div>
              <label className="block font-mono text-[11px] text-[#1c1c16] font-semibold mb-1">
                Municipal Officer Service ID
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727973] text-[18px]">
                  badge
                </span>
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f7f3ea] border border-[#c2c8c2]/50 rounded-lg font-mono text-xs focus:outline-none focus:border-[#051c11]"
                  placeholder="ENG-GCC-W42"
                />
              </div>
            </div>

            {/* Zonal Department Dropdown */}
            <div>
              <label className="block font-mono text-[11px] text-[#1c1c16] font-semibold mb-1">
                Zonal Administrative Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-[#f7f3ea] border border-[#c2c8c2]/50 rounded-lg font-mono text-xs focus:outline-none focus:border-[#051c11] cursor-pointer"
              >
                <option value="Public Works & Highways (GCC Works)">Public Works &amp; Highways (GCC Works)</option>
                <option value="Electrical Department (TANGEDCO/BESCOM)">Electrical Department (TANGEDCO/BESCOM)</option>
                <option value="Metro Water & Sewerage Board (CMWSSB/BWSSB)">Metro Water &amp; Sewerage Board (CMWSSB/BWSSB)</option>
                <option value="Zonal Solid Waste Management & Sanitation">Zonal Solid Waste Management &amp; Sanitation</option>
              </select>
            </div>

            {/* Security Token / HSM Passcode */}
            <div>
              <label className="block font-mono text-[11px] text-[#1c1c16] font-semibold mb-1">
                HSM Security Token / Cryptographic Passcode
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727973] text-[18px]">
                  key
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={hsmPasscode}
                  onChange={(e) => setHsmPasscode(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-[#f7f3ea] border border-[#c2c8c2]/50 rounded-lg font-mono text-xs focus:outline-none focus:border-[#051c11]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727973] hover:text-[#1c1c16]"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1a3125] text-white rounded-xl font-mono text-xs font-semibold hover:bg-[#051c11] transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>Authenticate Municipal SSO</span>
              <span className="material-symbols-outlined text-[16px]">login</span>
            </button>
          </form>
        )}

        {/* ================= DEVELOPER / DEMO SHORTCUTS ================= */}
        <div className="mt-6 pt-4 border-t border-[#ece8df] flex flex-col gap-2">
          <span className="font-mono text-[10px] text-[#727973] uppercase tracking-wider block font-semibold text-center">
            Evaluator &amp; Demo Shortcuts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="py-2 px-2.5 rounded-lg bg-[#f2ede4] hover:bg-[#ece8df] text-[#051c11] font-mono text-[11px] font-semibold border border-[#c2c8c2]/40 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              <span>Auto-Fill Demo</span>
            </button>
            <button
              type="button"
              onClick={handleInstantGuestAccess}
              className="py-2 px-2.5 rounded-lg bg-[#cee9d7] hover:bg-[#b2cdbb] text-[#082015] font-mono text-[11px] font-bold border border-[#4c6451]/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>1-Click Guest Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="text-center font-mono text-[11px] text-[#727973] py-4">
        Greater Chennai Corporation • Municipal SSO Node 42 • TLS 1.3 Certified
      </div>
    </div>
  );
};
