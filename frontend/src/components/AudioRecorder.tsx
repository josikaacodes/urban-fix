import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Check, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onTranscriptReady: (transcript: string) => void;
  initialTranscript?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptReady, initialTranscript = '' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const samplePhrases = [
    { lang: 'English', text: '“There is a large pothole near the government school gate on Porur main road.”' },
    { lang: 'Tamil', text: '“School pakkathula road la periya pothole irukku, two-wheeler ku romba dangerous.”' },
    { lang: 'Tanglish', text: '“Road la romba periya hole irukku near school, please fix urgently.”' },
    { lang: 'Hindi', text: '“Main road par school ke paas bada gaddha hai, accident ka khatra hai.”' },
  ];

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = selectedLanguage;

    rec.onresult = (event: any) => {
      let currentInterim = '';
      let finalTranscript = transcript;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setTranscript(finalTranscript);
      setInterimTranscript(currentInterim);
      onTranscriptReady(finalTranscript || currentInterim);
    };

    rec.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    rec.onend = () => {
      if (isRecording) {
        try {
          rec.start();
        } catch (e) {
          setIsRecording(false);
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (rec) rec.stop();
      stopAudioVisualizer();
    };
  }, [selectedLanguage]);

  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        setAudioLevel(Math.min(100, Math.round((sum / bufferLength / 255) * 100)));

        ctx.fillStyle = '#173B57';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (canvas.height - 4);
          ctx.fillStyle = '#24875D';
          ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight + 2);
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn('Microphone visualizer unavailable:', e);
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const toggleRecording = () => {
    if (!isRecording) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = selectedLanguage;
          recognitionRef.current.start();
        }
        startAudioVisualizer();
        setIsRecording(true);
      } catch (e) {
        console.error('Failed to start speech recording:', e);
      }
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
      stopAudioVisualizer();
      setIsRecording(false);
    }
  };

  const handleApplySample = (text: string) => {
    const clean = text.replace(/[“”]/g, '');
    setTranscript(clean);
    onTranscriptReady(clean);
  };

  return (
    <div className="p-4 sm:p-5 bg-[#F7F9FA] rounded-lg border border-[#C8D3D9] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C8D3D9] pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#24875D]" />
            <span>Civic Dispatch — Multilingual Voice Report</span>
          </h4>
          <p className="text-[11px] text-[#5C6971]">Speak in English, Tamil, Tanglish or Hindi</p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#5C6971]">Input Dialect:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isRecording}
            className="bg-white border border-[#C8D3D9] rounded px-2 py-1 text-xs text-[#24333D] font-medium focus:outline-none focus:border-[#246B8E]"
          >
            <option value="en-IN">English (India)</option>
            <option value="ta-IN">Tamil (தமிழ்)</option>
            <option value="hi-IN">Hindi (हिंदी)</option>
          </select>
        </div>
      </div>

      {/* Recording Control & Waveform Animation */}
      <div className="flex flex-col items-center justify-center p-4 bg-[#E9EEF1] rounded-lg border border-[#C8D3D9] space-y-3">
        {isRecording ? (
          <div className="w-full flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C64646]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C64646] animate-ping"></span>
              <span>Listening to your voice... (Speak clearly)</span>
            </div>
            <canvas
              ref={canvasRef}
              width={260}
              height={40}
              className="rounded bg-[#173B57] border border-[#246B8E]"
            />
          </div>
        ) : (
          <p className="text-xs text-[#5C6971] text-center max-w-sm">
            Tap the button below and speak in your natural voice to describe the issue and its location.
          </p>
        )}

        <button
          type="button"
          onClick={toggleRecording}
          className={px-5 py-2.5 rounded-md font-semibold text-xs transition-all flex items-center gap-2 shadow-xs }
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-[#24875D]" />
              <span>Tap to Speak Voice Report</span>
            </>
          )}
        </button>
      </div>

      {/* Transcript Textbox (Editable) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#24333D]">Recognized Speech Transcript (Editable)</label>
          {transcript && (
            <button
              type="button"
              onClick={() => {
                setTranscript('');
                setInterimTranscript('');
                onTranscriptReady('');
              }}
              className="text-[11px] text-[#C64646] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <textarea
          value={transcript + (interimTranscript ?  (...) : '')}
          onChange={(e) => {
            setTranscript(e.target.value);
            onTranscriptReady(e.target.value);
          }}
          placeholder="Your voice transcript will appear here automatically. You can also edit or type directly..."
          rows={3}
          className="w-full p-2.5 bg-white border border-[#C8D3D9] rounded-md text-xs text-[#24333D] focus:outline-none focus:border-[#246B8E] focus:ring-1 focus:ring-[#246B8E] leading-relaxed"
        />
      </div>

      {/* Suggested Quick Test Phrases */}
      <div className="p-3 bg-white rounded-md border border-[#C8D3D9] space-y-2">
        <p className="text-[11px] font-semibold text-[#5C6971]">Quick Voice Test Phrases (Click to test AI engine):</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {samplePhrases.map((p) => (
            <button
              key={p.lang}
              type="button"
              onClick={() => handleApplySample(p.text)}
              className="text-left p-2 rounded bg-[#E9EEF1] hover:bg-[#DDE5E9] border border-[#C8D3D9] text-[11px] text-[#24333D] transition-colors"
            >
              <span className="font-bold text-[#173B57] mr-1">[{p.lang}]:</span>
              <span className="text-[#5C6971]">{p.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
