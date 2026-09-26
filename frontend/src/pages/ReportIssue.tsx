import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api/client';
import { AIAnalysisResult, DuplicateMatch } from '../types';
import { Camera, Mic, MapPin, Sparkles, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import AudioRecorder from '../components/AudioRecorder';
import PriorityBadge from '../components/PriorityBadge';

const CHENNAI_WARDS = [
  'Ward 1 (Tondiarpet)', 'Ward 2 (Royapuram)', 'Ward 3 (Thiru Vi Ka Nagar)',
  'Ward 4 (Anna Nagar)', 'Ward 5 (Ambattur)', 'Ward 6 (Kodambakkam)',
  'Ward 7 (Valasaravakkam)', 'Ward 8 (Alandur)', 'Ward 9 (Adyar)',
  'Ward 10 (T Nagar / Kodambakkam)', 'Ward 11 (Perungudi)', 'Ward 12 (Sholinganallur)',
  'Ward 13 (Velachery)', 'Ward 14 (Porur)', 'Ward 15 (Tambaram)',
];

const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<'photo' | 'voice' | 'text'>('text');
  const [text, setText] = useState('');
  const [landmark, setLandmark] = useState('Near Metro Pillar 120, 100ft Road, Vadapalani');
  const [ward, setWard] = useState('Ward 10 (T Nagar / Kodambakkam)');
  const [latitude, setLatitude] = useState(13.0478);
  const [longitude, setLongitude] = useState(80.2197);
  const [anonymous, setAnonymous] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateMatch | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState('');

  const handleRunAI = async () => {
    if (!text.trim()) {
      setError('Please enter a description or record voice');
      return;
    }
    setError('');
    setAnalyzingAi(true);
    try {
      const res = await apiService.analyzeReport(text, landmark, inputMode);
      setAnalysisResult(res.data);
      const dupRes = await apiService.checkDuplicate(
        res.data.detected_category,
        latitude,
        longitude,
        text,
      );
      setDuplicateResult(dupRes.data);
      setStep(2);
    } catch {
      setError('AI Analysis failed. Please try again.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleFinalSubmit = async (joinIncidentId?: string) => {
    setSubmitting(true);
    try {
      const res = await apiService.submitReport({
        input_type: inputMode,
        original_text: text,
        latitude,
        longitude,
        landmark,
        ward,
        anonymous,
        join_incident_id: joinIncidentId,
      });
      if (res.data.incident_id) {
        navigate(`/citizen/track/${res.data.incident_id}`);
      } else {
        navigate('/citizen');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Submission failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9EEF1] flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 flex-1 w-full">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-4 py-2 text-sm font-semibold ${inputMode === 'text' ? 'border-b-2 border-[#173B57] text-[#173B57]' : 'text-slate-400'}`}
                >
                  Text / Photo
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('voice')}
                  className={`px-4 py-2 text-sm font-semibold ${inputMode === 'voice' ? 'border-b-2 border-[#173B57] text-[#173B57]' : 'text-slate-400'}`}
                >
                  Voice AI Dispatch
                </button>
              </div>

              {inputMode === 'voice' && (
                <AudioRecorder onTranscript={(t) => setText(t)} />
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Describe the Issue</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder="e.g. Large pothole near Vadapalani junction causing traffic blockage"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Landmark / Street</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {CHENNAI_WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAI}
                disabled={analyzingAi}
                className="w-full py-3.5 bg-[#173B57] text-white rounded-xl font-semibold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{analyzingAi ? 'Running UrbanFix AI Pipeline...' : 'Analyze Issue with AI'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">AI Insights Complete</span>
                  <PriorityBadge score={analysisResult?.priority_score || 75} />
                </div>
                <p className="text-xs text-slate-700">{analysisResult?.standardized_description}</p>
              </div>

              {duplicateResult?.is_duplicate && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-amber-700" />
                    <strong className="text-xs text-amber-900">
                      Similar Issue Detected ({duplicateResult.distance_meters}m away)
                    </strong>
                  </div>
                  <p className="text-xs text-amber-800">
                    Master Incident {duplicateResult.existing_incident?.incident_code} already exists.
                    Joining adds +1 citizen upvote and boosts dispatch priority.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit(duplicateResult.existing_incident?.id)}
                    className="w-full py-2.5 bg-[#24875D] text-white rounded-lg text-xs font-semibold"
                  >
                    Join Existing Incident (Recommended)
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleFinalSubmit()}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#173B57] text-white rounded-xl font-semibold text-sm disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit as New Incident'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default ReportIssue;
