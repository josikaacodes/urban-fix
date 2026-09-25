import React, { useState } from 'react';
import { Ticket, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface LandingPageProps {
  onNavigateLogin: (defaultRole?: 'citizen' | 'official') => void;
  onNavigateDashboard: () => void;
  onNavigateCitizen: () => void;
  onOpenReportModal?: () => void;
  tickets: Ticket[];
  language: Language;
  onToggleLanguage: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateDashboard,
  onNavigateCitizen,
  onOpenReportModal,
  tickets,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInTab, setSignInTab] = useState<'resident' | 'authority'>('resident');
  const [residentPhone, setResidentPhone] = useState('+91 98401 24789');
  const [authorityId, setAuthorityId] = useState('ENG-GCC-W42');

  const handleModalSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignInModal(false);
    if (signInTab === 'resident') {
      onNavigateCitizen();
    } else {
      onNavigateDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf9f0] text-[#1c1c16] flex flex-col font-body selection:bg-[#c9e4cc] selection:text-[#4e6753] civic-carto-grid">
      {/* ================= STICKY NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-[#f2ede4]/90 backdrop-blur-md border-b border-[#c2c8c2]/40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Brand Mark */}
        <div className="flex items-center gap-3">
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-[#1a3125] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[19px]">location_on</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#051c11] font-headline">
                {t.brandName}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#cee9d7] text-[#082015] font-mono text-[10px] font-semibold tracking-wider uppercase">
                {t.govDeskTag}
              </span>
            </div>
          </a>
        </div>

        {/* Section Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium text-[#424844]">
          <a href="#home" className="hover:text-[#051c11] transition-colors">{t.navHome}</a>
          <a href="#how-it-works" className="hover:text-[#051c11] transition-colors">{t.navHowItWorks}</a>
          <a href="#features" className="hover:text-[#051c11] transition-colors">{t.navFeatures}</a>
          <a href="#impact" className="hover:text-[#051c11] transition-colors">{t.navImpact}</a>
          <a href="#solutions" className="hover:text-[#051c11] transition-colors">{t.navSolutions}</a>
          <a href="#communities" className="hover:text-[#051c11] transition-colors">{t.navCommunities}</a>
        </nav>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Bilingual Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white text-[#051c11] border border-[#c2c8c2]/50 font-mono text-xs transition-colors shadow-xs"
            title="Switch Language (English / தமிழ்)"
          >
            <span className="material-symbols-outlined text-[15px] text-[#4c6451]">translate</span>
            <span className="font-semibold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Sign In Button */}
          <button
            onClick={() => setShowSignInModal(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#051c11] bg-[#ece8df] hover:bg-[#e6e2d9] border border-[#c2c8c2]/40 transition-colors font-medium"
          >
            {t.signIn}
          </button>

          {/* Primary Report CTA */}
          <button
            onClick={onOpenReportModal || onNavigateCitizen}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold text-white bg-[#1a3125] hover:bg-[#051c11] transition-all shadow-xs cursor-pointer active:scale-95"
            title="Report New Civic Issue"
          >
            <span className="material-symbols-outlined text-[15px]">add_a_photo</span>
            <span>{t.reportCTA}</span>
          </button>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section id="home" className="relative pt-12 pb-16 px-4 sm:px-8 max-w-[1340px] mx-auto w-full flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f2ede4] border border-[#c2c8c2]/50 text-[#4c6451] font-mono text-xs mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#4c6451] animate-pulse"></span>
          <span>{t.heroBadge}</span>
        </div>

        {/* Headline with Stylized Underline */}
        <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#051c11] max-w-4xl leading-[1.15] text-balance">
          {t.heroHeadline1}{' '}
          <span className="relative inline-block text-[#1a3125]">
            {t.heroHeadline2}
            <svg
              className="absolute left-0 -bottom-2 w-full h-3 text-[#4c6451]/60"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
            >
              <path d="M0 15 Q 50 0 100 15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* Body Subtitle */}
        <p className="font-body text-sm sm:text-base text-[#424844] max-w-2xl mt-6 leading-relaxed">
          {t.heroSub}
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
          <button
            onClick={onOpenReportModal || onNavigateCitizen}
            className="px-6 py-3 rounded-lg bg-[#1a3125] hover:bg-[#051c11] text-white font-mono text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            {t.ctaReportIssue}
          </button>
          <a
            href="#how-it-works"
            className="px-5 py-3 rounded-lg bg-[#ece8df] hover:bg-[#e6e2d9] text-[#051c11] border border-[#c2c8c2]/50 font-mono text-xs sm:text-sm font-medium transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            {t.ctaHowItWorks}
          </a>
        </div>

        {/* Hero Image Frame with 3 Floating Overlays */}
        <div className="relative mt-12 w-full max-w-5xl rounded-2xl border border-[#c2c8c2]/60 overflow-hidden shadow-xl bg-white">
          <div className="aspect-[16/9] sm:aspect-[21/9] w-full relative bg-[#ece8df] overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz6B-UMKUT6h1oA13j5np9uR1eq0tVIV3Qwt52XA4iX4ZUwqhf3co9-8d-sffZApB4-yNAMOeOadZ-goE0qMhu73NSyJaGMOH8LBAqQRnHCLDnPE5tEbU7yrdOWE4EdY2TExhpWLgZF2MKBSPRUcnSUGcogQFjWgY1U1K27uVlAwJ4xYXtq9dLIBHCtnF-4aRsmECeEsON1uRX5-x5TiIKSRQrgEmyWw_ktouIDx9dIQMi0GmzrMXdSw"
              alt="UrbanFix AI Civic Intelligence Street View"
              className="w-full h-full object-cover filter contrast-[1.02]"
              referrerPolicy="no-referrer"
            />
            {/* Subtle Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#051c11]/80 via-transparent to-black/20"></div>

            {/* Overlay 1: Top Left - Pothole Urgent Alert */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#ffb59c] shadow-lg flex items-center gap-3 text-left animate-in fade-in slide-in-from-left-4">
              <span className="w-8 h-8 rounded-full bg-[#4d1e0d] text-[#ffdbcf] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#ba1a1a]">#W42-9842</span>
                  <span className="px-1.5 py-0.2 bg-[#ffdbcf] text-[#370e01] font-mono text-[9px] font-bold rounded">
                    CRITICAL &lt;4h
                  </span>
                </div>
                <div className="font-headline text-xs font-bold text-[#051c11] leading-tight mt-0.5">
                  {t.floatingAlertPothole}
                </div>
                <span className="font-mono text-[10px] text-[#727973]">Ward 42 • 12m ago</span>
              </div>
            </div>

            {/* Overlay 2: Bottom Left - Streetlight Repaired Verification Badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#c9e4cc] shadow-lg flex items-center gap-3 text-left">
              <span className="w-8 h-8 rounded-full bg-[#1a3125] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#051c11]">#W42-9839</span>
                  <span className="px-1.5 py-0.2 bg-[#c9e4cc] text-[#092011] font-mono text-[9px] font-bold rounded">
                    MET SLA
                  </span>
                </div>
                <div className="font-headline text-xs font-bold text-[#051c11] leading-tight mt-0.5">
                  {t.floatingAlertStreetlight}
                </div>
                <span className="font-mono text-[10px] text-[#4c6451]">Lineman Unit 3 • Hydrostatic pass</span>
              </div>
            </div>

            {/* Overlay 3: Bottom Right - Citizen Endorsement Chip */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#051c11]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/20 shadow-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-[#cee9d7]">thumb_up</span>
              <span className="font-mono text-xs font-semibold">{t.floatingEndorsement}</span>
            </div>
          </div>
        </div>

        {/* ================= IMPACT STATS STRIP (4 Columns) ================= */}
        <div id="impact" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 w-full max-w-5xl text-left border-y border-[#c2c8c2]/30 py-6 bg-white/70 backdrop-blur-sm rounded-2xl px-6 shadow-xs">
          <div>
            <span className="font-mono text-[11px] text-[#727973] uppercase tracking-wider block font-semibold">
              {t.statIntakeLabel}
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#051c11] tabular-nums mt-1">
              {t.statIntakeVal}
            </div>
            <span className="text-xs font-mono text-[#4c6451]">{t.statIntakeDesc}</span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#727973] uppercase tracking-wider block font-semibold">
              {t.statSlaLabel}
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#051c11] tabular-nums mt-1">
              {t.statSlaVal}
            </div>
            <span className="text-xs font-mono text-[#4c6451]">{t.statSlaDesc}</span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#727973] uppercase tracking-wider block font-semibold">
              {t.statAccountabilityLabel}
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#051c11] tabular-nums mt-1">
              {t.statAccountabilityVal}
            </div>
            <span className="text-xs font-mono text-[#4c6451]">{t.statAccountabilityDesc}</span>
          </div>

          <div>
            <span className="font-mono text-[11px] text-[#727973] uppercase tracking-wider block font-semibold">
              {t.statEcosystemLabel}
            </span>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#051c11] tabular-nums mt-1">
              {t.statEcosystemVal}
            </div>
            <span className="text-xs font-mono text-[#4c6451]">{t.statEcosystemDesc}</span>
          </div>
        </div>
      </section>

      {/* ================= ARCHITECTURAL FRICTION VS. CLARITY ================= */}
      <section className="py-16 px-4 sm:px-8 max-w-[1200px] mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="font-mono text-xs text-[#4c6451] uppercase tracking-wider block mb-1">
            System Transformation
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#051c11]">
            From Fragmented Grievances to Deterministic Triage
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-[#f2ede4]/80 p-6 rounded-2xl border border-[#c2c8c2]/50 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] font-mono text-xs font-bold mb-3">
                <span className="material-symbols-outlined text-[15px]">close</span>
                {t.frictionBeforeTitle}
              </div>
              <p className="font-body text-xs sm:text-sm text-[#424844] leading-relaxed">
                {t.frictionBeforeSub}
              </p>
            </div>
            <ul className="mt-4 pt-3 border-t border-[#c2c8c2]/30 flex flex-col gap-2 font-mono text-xs text-[#727973]">
              <li className="flex items-center gap-2">✕ Unverified telephone complaints</li>
              <li className="flex items-center gap-2">✕ Duplicate dispatches to the same pothole</li>
              <li className="flex items-center gap-2">✕ Zero closure sign-off visibility</li>
            </ul>
          </div>

          {/* After */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#1a3125] shadow-md flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#c9e4cc] text-[#092011] font-mono text-xs font-bold mb-3">
                <span className="material-symbols-outlined text-[15px]">check</span>
                {t.frictionAfterTitle}
              </div>
              <p className="font-body text-xs sm:text-sm text-[#1c1c16] leading-relaxed">
                {t.frictionAfterSub}
              </p>
            </div>
            <ul className="mt-4 pt-3 border-t border-[#c2c8c2]/30 flex flex-col gap-2 font-mono text-xs text-[#1a3125] font-semibold">
              <li className="flex items-center gap-2">✓ Multimodal voice &amp; photogrammetry analysis</li>
              <li className="flex items-center gap-2">✓ Real-time 25m spatiotemporal deduplication</li>
              <li className="flex items-center gap-2">✓ Immutable citizen audit gate &amp; seal</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP CONTINUUM ================= */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 max-w-[1340px] mx-auto w-full border-t border-[#c2c8c2]/30">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-mono text-xs text-[#4c6451] uppercase tracking-wider block mb-1">
            Operational Lifecycle
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-bold text-[#051c11]">
            The 4-Step Resolution Continuum
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#f2ede4] text-[#1a3125] flex items-center justify-center font-bold mb-4 font-mono text-sm">
                01
              </div>
              <h3 className="font-headline text-base font-bold text-[#051c11] mb-2">{t.step1Title}</h3>
              <p className="font-body text-xs text-[#424844] leading-relaxed">{t.step1Desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#c2c8c2]/20 font-mono text-[11px] text-[#4c6451]">
              Photo + Web Speech en-IN
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#f2ede4] text-[#1a3125] flex items-center justify-center font-bold mb-4 font-mono text-sm">
                02
              </div>
              <h3 className="font-headline text-base font-bold text-[#051c11] mb-2">{t.step2Title}</h3>
              <p className="font-body text-xs text-[#424844] leading-relaxed">{t.step2Desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#c2c8c2]/20 font-mono text-[11px] text-[#4c6451]">
              98.4% AI Vision Confidence
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#f2ede4] text-[#1a3125] flex items-center justify-center font-bold mb-4 font-mono text-sm">
                03
              </div>
              <h3 className="font-headline text-base font-bold text-[#051c11] mb-2">{t.step3Title}</h3>
              <p className="font-body text-xs text-[#424844] leading-relaxed">{t.step3Desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#c2c8c2]/20 font-mono text-[11px] text-[#4c6451]">
              Critical &lt;4h SLA Clock
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#c9e4cc] text-[#092011] flex items-center justify-center font-bold mb-4 font-mono text-sm">
                04
              </div>
              <h3 className="font-headline text-base font-bold text-[#051c11] mb-2">{t.step4Title}</h3>
              <p className="font-body text-xs text-[#424844] leading-relaxed">{t.step4Desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#c2c8c2]/20 font-mono text-[11px] text-[#4c6451] font-bold">
              Citizen 5-Star Sign-Off
            </div>
          </div>
        </div>
      </section>

      {/* ================= MUNICIPAL TOOLKIT (6 Features) ================= */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-[1340px] mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-mono text-xs text-[#4c6451] uppercase tracking-wider block mb-1">
            Engineered Capabilities
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-bold text-[#051c11]">
            {t.toolkitHeader}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/30 shadow-xs hover:border-[#4c6451] transition-all">
            <span className="material-symbols-outlined text-[26px] text-[#1a3125] mb-2">mic</span>
            <h3 className="font-headline text-sm font-bold text-[#051c11] mb-1">{t.tool1Title}</h3>
            <p className="font-body text-xs text-[#424844] leading-relaxed">{t.tool1Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/30 shadow-xs hover:border-[#4c6451] transition-all">
            <span className="material-symbols-outlined text-[26px] text-[#1a3125] mb-2">auto_awesome</span>
            <h3 className="font-headline text-sm font-bold text-[#051c11] mb-1">{t.tool2Title}</h3>
            <p className="font-body text-xs text-[#424844] leading-relaxed">{t.tool2Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/30 shadow-xs hover:border-[#4c6451] transition-all">
            <span className="material-symbols-outlined text-[26px] text-[#1a3125] mb-2">explore</span>
            <h3 className="font-headline text-sm font-bold text-[#051c11] mb-1">{t.tool3Title}</h3>
            <p className="font-body text-xs text-[#424844] leading-relaxed">{t.tool3Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/30 shadow-xs hover:border-[#4c6451] transition-all">
            <span className="material-symbols-outlined text-[26px] text-[#1a3125] mb-2">timer</span>
            <h3 className="font-headline text-sm font-bold text-[#051c11] mb-1">{t.tool4Title}</h3>
            <p className="font-body text-xs text-[#424844] leading-relaxed">{t.tool4Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/30 shadow-xs hover:border-[#4c6451] transition-all">
            <span className="material-symbols-outlined text-[26px] text-[#1a3125] mb-2">rate_review</span>
            <h3 className="font-headline text-sm font-bold text-[#051c11] mb-1">{t.tool5Title}</h3>
            <p className="font-body text-xs text-[#424844] leading-relaxed">{t.tool5Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#c2c8c2]/30 shadow-xs hover:border-[#4c6451] transition-all">
            <span className="material-symbols-outlined text-[26px] text-[#1a3125] mb-2">dashboard</span>
            <h3 className="font-headline text-sm font-bold text-[#051c11] mb-1">{t.tool6Title}</h3>
            <p className="font-body text-xs text-[#424844] leading-relaxed">{t.tool6Desc}</p>
          </div>
        </div>
      </section>

      {/* ================= DUAL-ROLE PRESENTATION ================= */}
      <section id="solutions" className="py-16 px-4 sm:px-8 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* For Citizens */}
          <div className="bg-white p-8 rounded-2xl border border-[#c2c8c2]/40 shadow-xs flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded bg-[#c9e4cc] text-[#092011] font-mono text-[11px] font-bold uppercase tracking-wider">
                {t.forCitizensSub}
              </span>
              <h3 className="font-headline text-xl font-bold text-[#051c11] mt-3 mb-2">
                {t.forCitizensTitle}
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#424844] leading-relaxed">
                {t.forCitizensDesc}
              </p>
            </div>
            <button
              onClick={onNavigateCitizen}
              className="mt-6 w-full py-2.5 rounded-lg bg-[#1a3125] text-white font-mono text-xs font-semibold hover:bg-[#051c11] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Open Citizen Resident Desk</span>
            </button>
          </div>

          {/* For Authorities */}
          <div className="bg-white p-8 rounded-2xl border border-[#c2c8c2]/40 shadow-xs flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded bg-[#f2ede4] text-[#1a3125] font-mono text-[11px] font-bold uppercase tracking-wider">
                {t.forAuthoritiesSub}
              </span>
              <h3 className="font-headline text-xl font-bold text-[#051c11] mt-3 mb-2">
                {t.forAuthoritiesTitle}
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#424844] leading-relaxed">
                {t.forAuthoritiesDesc}
              </p>
            </div>
            <button
              onClick={onNavigateDashboard}
              className="mt-6 w-full py-2.5 rounded-lg bg-[#ece8df] hover:bg-[#e6e2d9] text-[#051c11] border border-[#c2c8c2]/50 font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Launch Municipal Command Console</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= DEEP FOREST GREEN CTA SECTION ================= */}
      <section id="communities" className="py-16 px-4 sm:px-8 max-w-[1340px] mx-auto w-full">
        <div className="bg-[#1a3125] text-white rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#cee9d7] font-mono text-xs mb-4">
            <span className="material-symbols-outlined text-[15px]">apartment</span>
            <span>Bharat Civic Ordinance 2026 Compliant</span>
          </div>
          <h2 className="font-headline text-3xl sm:text-5xl font-bold max-w-2xl leading-tight">
            {t.ctaBottomTitle}
          </h2>
          <p className="font-body text-sm sm:text-base text-[#b2cdbb] max-w-xl mt-4">
            {t.ctaBottomSub}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
            <button
              onClick={onOpenReportModal || onNavigateCitizen}
              className="px-6 py-3 rounded-lg bg-[#cee9d7] text-[#082015] font-mono text-xs sm:text-sm font-bold hover:bg-white transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Report a Civic Defect
            </button>
            <button
              onClick={onNavigateDashboard}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-mono text-xs sm:text-sm font-semibold transition-all"
            >
              Explore Ward 42 Console
            </button>
          </div>
        </div>
      </section>

      {/* ================= INSTITUTIONAL FOOTER ================= */}
      <footer className="mt-auto bg-[#f2ede4] border-t border-[#c2c8c2]/30 py-8 px-4 sm:px-8 text-xs font-body text-[#424844]">
        <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1a3125] text-white flex items-center justify-center font-bold text-xs">
              <span className="material-symbols-outlined text-[14px]">shield</span>
            </div>
            <span className="font-headline font-bold text-[#051c11]">UrbanFix AI</span>
            <span className="text-[#727973]">•</span>
            <span className="font-mono text-[11px] text-[#727973]">Civic Open Data &amp; SLA Index</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a href="#impact" className="hover:text-[#051c11]">SLA Index</a>
            <a href="#features" className="hover:text-[#051c11]">Open Data API</a>
            <a href="#how-it-works" className="hover:text-[#051c11]">Privacy Charter</a>
            <button onClick={onToggleLanguage} className="hover:text-[#051c11] underline">
              {language === 'en' ? 'தமிழ் பதிப்பு' : 'English Version'}
            </button>
          </div>

          <div className="font-mono text-[10px] text-[#727973]">
            © 2026 Greater Chennai Corporation. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ================= EMBEDDED SIGN-IN MODAL ================= */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-[#31302b]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-[#c2c8c2]/50 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-[#1a3125] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#051c11]">UrbanFix Gateway</h3>
                  <span className="font-mono text-[10px] text-[#727973]">TLS 1.3 Certified Identity</span>
                </div>
              </div>
              <button
                onClick={() => setShowSignInModal(false)}
                className="text-[#727973] hover:text-[#1c1c16]"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex p-1 bg-[#f2ede4] rounded-lg mb-4 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSignInTab('resident')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                  signInTab === 'resident' ? 'bg-white text-[#051c11] shadow-xs' : 'text-[#424844]'
                }`}
              >
                Citizen Resident
              </button>
              <button
                type="button"
                onClick={() => setSignInTab('authority')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                  signInTab === 'authority' ? 'bg-white text-[#051c11] shadow-xs' : 'text-[#424844]'
                }`}
              >
                Municipal Authority
              </button>
            </div>

            <form onSubmit={handleModalSignIn} className="flex flex-col gap-3 text-xs font-body">
              {signInTab === 'resident' ? (
                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#1c1c16] mb-1">
                    Mobile Number (+91 Prefix)
                  </label>
                  <input
                    type="text"
                    value={residentPhone}
                    onChange={(e) => setResidentPhone(e.target.value)}
                    className="w-full p-2 bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded font-mono text-xs focus:outline-none focus:border-[#051c11]"
                  />
                  <span className="text-[10px] font-mono text-[#727973] mt-1 block">
                    Instant 6-digit SMS OTP verification
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block font-mono text-[11px] font-semibold text-[#1c1c16] mb-1">
                    Municipal Officer ID / SSO Key
                  </label>
                  <input
                    type="text"
                    value={authorityId}
                    onChange={(e) => setAuthorityId(e.target.value)}
                    className="w-full p-2 bg-[#f7f3ea] border border-[#c2c8c2]/40 rounded font-mono text-xs focus:outline-none focus:border-[#051c11]"
                  />
                  <span className="text-[10px] font-mono text-[#727973] mt-1 block">
                    Secured by GCC HSM Token Gateway
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df] mt-2">
                <button
                  type="button"
                  onClick={() => setShowSignInModal(false)}
                  className="px-3.5 py-2 rounded bg-[#f2ede4] font-mono text-xs hover:bg-[#ece8df]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#1a3125] text-white font-mono text-xs font-semibold hover:bg-[#051c11]"
                >
                  Enter Portal →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
