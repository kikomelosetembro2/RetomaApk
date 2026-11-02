import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  MapPin, 
  Navigation, 
  Star, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Eye, 
  Compass, 
  ExternalLink,
  MessageCircle,
  Phone,
  Layers,
  Search
} from 'lucide-react';
import { RETOMA_PHONE_DISPLAY, RETOMA_WHATSAPP_OFFICIAL } from '../data/initialData';

interface PromoVideoPlayerProps {
  onContractClick?: () => void;
  onScheduleClick?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const PromoVideoPlayer: React.FC<PromoVideoPlayerProps> = ({
  onContractClick,
  onScheduleClick,
  isModal = false,
  onClose,
}) => {
  // Video Playback State (30 seconds total)
  const TOTAL_DURATION = 30; // seconds
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTabScene, setActiveTabScene] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Web Audio Synth for subtle promotional sound effects
  const playSoundEffect = (type: 'beep' | 'chime' | 'success') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Audio not permitted or unsupported
    }
  };

  // Playback timer loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  // Determine active scene based on currentTime
  // Scene 1: 0 - 8s (Google Maps & Mac/Mobile search)
  // Scene 2: 8 - 15s (GPS Route & Immediate Navigation in 30s)
  // Scene 3: 15 - 23s (Smart NFC Card Touch & 5-Star Review)
  // Scene 4: 23 - 30s (30 Seconds Business Advantages & Local Dominance)
  const currentScene = currentTime < 8 ? 1 : currentTime < 15 ? 2 : currentTime < 23 ? 3 : 4;

  // Sound triggers on scene transitions
  useEffect(() => {
    if (currentScene !== activeTabScene) {
      setActiveTabScene(currentScene);
      if (currentScene === 3) {
        playSoundEffect('beep'); // NFC tap sound
      } else if (currentScene === 4) {
        playSoundEffect('chime'); // Success fan-fare
      }
    }
  }, [currentScene, activeTabScene]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Restart video
  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    playSoundEffect('chime');
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (!next) {
      playSoundEffect('beep');
    }
  };

  // Jump to specific time/scene
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const ms = Math.floor((seconds - s) * 10);
    const secs = s < 10 ? `0${s}` : `${s}`;
    return `00:${secs}.${ms}s`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-950 border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between ${
        isFullscreen ? 'h-screen w-screen p-6' : 'max-w-5xl mx-auto'
      }`}
    >
      {/* Top Video Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between gap-3 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-blue-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm sm:text-base tracking-tight">
                Vídeo Oficial de Apresentação (30 Segundos)
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>HD 1080p</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Como sua empresa é localizada no <strong>Google Mapas / Mac</strong> e as vantagens em <strong>30 segundos</strong>
            </p>
          </div>
        </div>

        {/* Scene Navigation Pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
          <button
            onClick={() => handleSeek(0)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              currentScene === 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Busca no Mapa (Mac/GPS)
          </button>
          <button
            onClick={() => handleSeek(8)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              currentScene === 2 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Rota em 30 Segundos
          </button>
          <button
            onClick={() => handleSeek(15)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              currentScene === 3 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Toque NFC & 5 Estrelas
          </button>
          <button
            onClick={() => handleSeek(23)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              currentScene === 4 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Vantagens Imediatas
          </button>
        </div>

        {/* Close Button if Modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIDEO SCREEN CANVAS & SIMULATED HIGH-DEF SCENES          */}
      {/* ======================================================== */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center select-none group">
        {/* Animated Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />

        {/* ======================================================== */}
        {/* CENA 1: BUSCA NO GOOGLE MAPAS NO MAC / PC / SMARTPHONE   */}
        {/* (00:00 - 00:08)                                          */}
        {/* ======================================================== */}
        {currentScene === 1 && (
          <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between animate-fade-in">
            {/* Mac / Web Browser Chrome Mockup */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md max-w-2xl mx-auto w-full">
              {/* Browser Dots */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-400 font-mono ml-2">Mac OS • Safari • Google Maps</span>
                </div>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                  📍 Geolocalização Rio Branco - AC
                </span>
              </div>

              {/* Search Bar Simulation */}
              <div className="mt-2.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
                <Search className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-white font-medium">
                  {currentTime < 4 ? 'Melhor comércio perto de mim em Rio Branco...' : 'Auto Center & Serviços no Centro de Rio Branco'}
                </span>
                <span className="w-2 h-4 bg-blue-400 animate-pulse ml-auto" />
              </div>
            </div>

            {/* Interactive Animated Map Canvas Area */}
            <div className="relative flex-1 my-3 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
              {/* Map grid lines */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px]" />

              {/* Animated Map Streets & Pulse */}
              <div className="absolute w-72 h-72 rounded-full border border-blue-500/30 animate-ping opacity-25" />
              <div className="absolute w-96 h-96 rounded-full border border-blue-400/20 animate-pulse" />

              {/* Pin Oficial em Destaque 3D */}
              <div className="relative z-10 flex flex-col items-center transform transition-transform duration-700 hover:scale-105">
                <div className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 border border-red-400/40 animate-bounce">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>5.0 • SUA EMPRESA NO TOPO DO MAPA</span>
                </div>

                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/50 mt-1 border-2 border-white">
                  <MapPin className="w-7 h-7 fill-white" />
                </div>

                <div className="bg-slate-900/95 border border-blue-500/40 px-4 py-2 rounded-2xl shadow-2xl mt-2 text-center backdrop-blur-md">
                  <div className="text-xs font-black text-white flex items-center justify-center gap-1">
                    <span>SEU ESTABELECIMENTO</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Aberto Agora • 1º Lugar nas Buscas do Google</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Subtitle / Voiceover */}
            <div className="bg-slate-900/90 border border-blue-500/30 p-3 rounded-2xl text-center backdrop-blur-md">
              <p className="text-xs sm:text-sm font-semibold text-white">
                🎙️ <span className="text-blue-400 font-bold">Cena 1:</span> Quando qualquer pessoa pesquisa no Mac, PC ou celular, seu negócio aparece no topo do Google Mapas com rotas e fotos verificadas.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CENA 2: A ROTA GPS E DECISÃO EM 30 SEGUNDOS              */}
        {/* (00:08 - 00:15)                                          */}
        {/* ======================================================== */}
        {currentScene === 2 && (
          <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between animate-fade-in">
            {/* Top Stat Banner */}
            <div className="flex items-center justify-between bg-blue-950/80 border border-blue-500/40 p-3 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400 animate-spin-slow" />
                <span className="font-bold text-white text-xs sm:text-sm">
                  Traçando Rota GPS no Google Mapas
                </span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-xl border border-emerald-500/30">
                Chegada em 30 Segundos
              </span>
            </div>

            {/* Route Simulation Visual */}
            <div className="relative flex-1 my-3 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-center items-center overflow-hidden">
              <div className="w-full max-w-lg space-y-4">
                {/* Visual Route Track */}
                <div className="relative flex items-center justify-between">
                  {/* Start Point: Customer */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-bold">Cliente no Mac/Celular</span>
                  </div>

                  {/* Animated Route Line */}
                  <div className="flex-1 mx-4 relative">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, ((currentTime - 8) / 7) * 100)}%` }}
                      />
                    </div>
                    <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[10px] text-cyan-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-cyan-500/30">
                      Rota Rápida • 30 Segundos
                    </span>
                  </div>

                  {/* End Point: Your Business */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
                      <MapPin className="w-6 h-6 fill-slate-950" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Sua Empresa Física</span>
                  </div>
                </div>

                {/* Advantage Cards */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Decisão Rápida</span>
                    <strong className="text-xs text-white">30 Segundos</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Taxa de Visita</span>
                    <strong className="text-xs text-emerald-400">84% dos Buscadores</strong>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">GPS Integrado</span>
                    <strong className="text-xs text-cyan-400">Waze + Maps</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Subtitle / Voiceover */}
            <div className="bg-slate-900/90 border border-blue-500/30 p-3 rounded-2xl text-center backdrop-blur-md">
              <p className="text-xs sm:text-sm font-semibold text-white">
                🎙️ <span className="text-emerald-400 font-bold">Cena 2:</span> Vantagem imediata: em menos de 30 segundos, o cliente traça rota direta e vai até sua porta sem se perder.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CENA 3: A MÁGICA DO CARTÃO NFC E AVALIAÇÃO 5 ESTRELAS    */}
        {/* (00:15 - 00:23)                                          */}
        {/* ======================================================== */}
        {currentScene === 3 && (
          <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between animate-fade-in">
            {/* Top NFC Badge */}
            <div className="flex items-center justify-between bg-purple-950/80 border border-purple-500/40 p-3 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="font-bold text-white text-xs sm:text-sm">
                  Cartão Inteligente NFC Google Avaliação
                </span>
              </div>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-black px-3 py-1 rounded-xl border border-purple-500/30">
                Aproximou, Avaliou em 3 Segundos
              </span>
            </div>

            {/* Smartphone & NFC Proximity Simulation */}
            <div className="relative flex-1 my-3 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/30 rounded-2xl border border-purple-500/30 p-4 flex flex-col sm:flex-row items-center justify-around gap-6 overflow-hidden">
              {/* NFC Card on the Counter */}
              <div className="relative group">
                <div className="w-44 h-28 bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 rounded-2xl border-2 border-blue-400/60 p-3 shadow-2xl flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white tracking-wider">RETOMA NFC</span>
                    <Radio className="w-4 h-4 text-blue-400" />
                  </div>

                  <div className="text-center space-y-0.5">
                    <span className="text-[11px] font-bold text-white block">Avalie no Google</span>
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-1">
                    <span>Aproxime o Celular</span>
                    <span className="font-mono text-emerald-400 font-bold">5 Estrelas</span>
                  </div>
                </div>

                {/* Concentric NFC radio waves */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-purple-400/40 animate-ping pointer-events-none" />
              </div>

              {/* Smartphone Screen Pop-up */}
              <div className="w-48 bg-slate-950 rounded-2xl border-2 border-emerald-400/80 p-3 shadow-2xl space-y-2 transform translate-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-white">Google Avaliação</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold">Instatâneo</span>
                </div>

                <div className="text-center py-1 space-y-1">
                  <span className="text-[11px] font-bold text-slate-200 block">Sua Experiência foi 5 Estrelas?</span>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-400 block">"Atendimento impecável e rápido!"</span>
                </div>

                <div className="bg-blue-600 text-white font-bold text-[10px] text-center py-1.5 rounded-lg shadow">
                  Postar Avaliação no Google
                </div>
              </div>
            </div>

            {/* Bottom Subtitle / Voiceover */}
            <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-2xl text-center backdrop-blur-md">
              <p className="text-xs sm:text-sm font-semibold text-white">
                🎙️ <span className="text-purple-400 font-bold">Cena 3:</span> No balcão físico, o cliente encosta o celular no cartão NFC e a tela de 5 estrelas do Google abre instantaneamente sem digitar nada.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CENA 4: AS VANTAGENS EM 30 SEGUNDOS & RESULTADOS         */}
        {/* (00:23 - 00:30)                                          */}
        {/* ======================================================== */}
        {currentScene === 4 && (
          <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between animate-fade-in">
            {/* Top Success Banner */}
            <div className="flex items-center justify-between bg-emerald-950/80 border border-emerald-500/40 p-3 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white text-xs sm:text-sm">
                  Vantagens Comerciais Consolidadas em 30 Segundos
                </span>
              </div>
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-xl">
                Resultado Comprovado
              </span>
            </div>

            {/* 4 Cards of Advantages */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 flex-1 items-center">
              <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-2xl text-center space-y-1">
                <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-lg sm:text-xl font-black text-white block">+350%</span>
                <span className="text-[10px] text-slate-400 block">Volume de Avaliações 5 Estrelas</span>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/30 p-3 rounded-2xl text-center space-y-1">
                <MapPin className="w-5 h-5 text-blue-400 mx-auto" />
                <span className="text-lg sm:text-xl font-black text-white block">Top #1</span>
                <span className="text-[10px] text-slate-400 block">Ranking no Google Mapas</span>
              </div>

              <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-2xl text-center space-y-1">
                <Smartphone className="w-5 h-5 text-purple-400 mx-auto" />
                <span className="text-lg sm:text-xl font-black text-white block">30 Segundos</span>
                <span className="text-[10px] text-slate-400 block">Tempo do Cliente Chegar e Avaliar</span>
              </div>

              <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-2xl text-center space-y-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto" />
                <span className="text-lg sm:text-xl font-black text-white block">Confiança</span>
                <span className="text-[10px] text-slate-400 block">Reputação Blindada na Região</span>
              </div>
            </div>

            {/* Bottom Call to Action inside Video */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 border border-emerald-500/40 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-black text-white text-xs sm:text-sm block">
                  Coloque sua empresa no topo do Google Mapas hoje mesmo!
                </span>
                <span className="text-[11px] text-slate-300">
                  Planos com implantação, cartões NFC e suporte presencial em Rio Branco.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onContractClick && (
                  <button
                    onClick={onContractClick}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-md"
                  >
                    Emitir Contrato
                  </button>
                )}
                <a
                  href={`https://api.whatsapp.com/send?phone=${RETOMA_WHATSAPP_OFFICIAL}&text=${encodeURIComponent('Olá! Acabei de assistir ao vídeo de 30 segundos sobre o Google Mapas e Cartão NFC. Gostaria de implantar na minha empresa.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Oficial</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Video Overlay Watermark & Scene Tracker */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
          <div className="bg-slate-950/80 border border-slate-700/80 px-2.5 py-1 rounded-lg backdrop-blur-md text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>00:{Math.floor(currentTime) < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)} / 00:30</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIDEO CONTROLS & TIMELINE SCRUBBER                      */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 z-20">
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <div className="relative w-full h-2.5 bg-slate-800 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              handleSeek(ratio * TOTAL_DURATION);
            }}
          >
            {/* 4 Scene markers */}
            <div className="absolute top-0 left-[26.6%] w-0.5 h-full bg-slate-600" title="Cena 2: Rota GPS" />
            <div className="absolute top-0 left-[50%] w-0.5 h-full bg-slate-600" title="Cena 3: Cartão NFC" />
            <div className="absolute top-0 left-[76.6%] w-0.5 h-full bg-slate-600" title="Cena 4: Vantagens" />

            {/* Filled Progress */}
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-100 relative"
              style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-blue-500 group-hover:scale-125 transition-transform" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className={currentScene === 1 ? 'text-blue-400 font-bold' : ''}>1. Busca Maps</span>
              <span>•</span>
              <span className={currentScene === 2 ? 'text-blue-400 font-bold' : ''}>2. Rota 30s</span>
              <span>•</span>
              <span className={currentScene === 3 ? 'text-blue-400 font-bold' : ''}>3. NFC 5 Estrelas</span>
              <span>•</span>
              <span className={currentScene === 4 ? 'text-emerald-400 font-bold' : ''}>4. Resultados</span>
            </div>
            <span>00:30.0s</span>
          </div>
        </div>

        {/* Buttons Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={handleTogglePlay}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md"
              title={isPlaying ? 'Pausar Vídeo' : 'Reproduzir Vídeo'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            {/* Restart */}
            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Reiniciar Vídeo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
              title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMuted ? 'Sem Som' : 'Áudio Ativo'}</span>
            </button>

            {/* Playback speed */}
            <button
              onClick={() => setPlaybackSpeed((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold transition-colors cursor-pointer"
              title="Velocidade de Reprodução"
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Quick CTA Actions & Fullscreen */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden lg:inline">
              Tempo de vídeo: <strong>30 segundos</strong>
            </span>

            <button
              onClick={handleToggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
