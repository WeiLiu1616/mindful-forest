import { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, Music, CloudRain, Bird, Wind, Waves, ChevronUp, ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

type SoundType = 'rain' | 'birds' | 'wind' | 'stream';

interface NoiseChannel {
  name: string;
  icon: React.ReactNode;
  type: SoundType;
  volume: number;
  active: boolean;
}

const AmbientSound = () => {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'noise' | 'music'>('noise');
  const [masterMuted, setMasterMuted] = useState(false);
  const [neteaseUrl, setNeteaseUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState(() => {
    try { return localStorage.getItem('netease-embed-url') || ''; } catch { return ''; }
  });

  const [channels, setChannels] = useState<NoiseChannel[]>([
    { name: '雨声', icon: <CloudRain size={16} />, type: 'rain', volume: 0.5, active: false },
    { name: '鸟鸣', icon: <Bird size={16} />, type: 'birds', volume: 0.4, active: false },
    { name: '风声', icon: <Wind size={16} />, type: 'wind', volume: 0.3, active: false },
    { name: '溪流', icon: <Waves size={16} />, type: 'stream', volume: 0.4, active: false },
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Map<SoundType, { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode }>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.connect(ctx.destination);
      masterGainRef.current = master;
      audioCtxRef.current = ctx;
    }
    return audioCtxRef.current;
  }, []);

  const createNoise = useCallback((ctx: AudioContext, type: SoundType): AudioBufferSourceNode | OscillatorNode => {
    // Generate colored noise buffer
    const sampleRate = ctx.sampleRate;
    const duration = 4; // loop 4 seconds
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;

        if (type === 'rain') {
          // Brown noise with crackle
          b0 = (b0 + (0.02 * white)) / 1.02;
          data[i] = b0 * 3.5 + (Math.random() > 0.997 ? white * 0.3 : 0);
        } else if (type === 'birds') {
          // Chirp-like: filtered noise bursts
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11 * (Math.sin(i / (sampleRate * 0.15)) > 0.7 ? 2.5 : 0.1);
        } else if (type === 'wind') {
          // Pink-ish noise
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
          b6 = white * 0.115926;
        } else {
          // Stream: modulated brown noise
          b0 = (b0 + (0.02 * white)) / 1.02;
          const mod = Math.sin(i / (sampleRate * 0.8)) * 0.5 + 0.5;
          data[i] = b0 * 3.5 * (0.3 + mod * 0.7);
        }
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }, []);

  const startSound = useCallback((type: SoundType, volume: number) => {
    const ctx = getAudioCtx();
    if (nodesRef.current.has(type)) return;

    const source = createNoise(ctx, type);
    const gain = ctx.createGain();
    gain.gain.value = masterMuted ? 0 : volume;
    source.connect(gain);
    gain.connect(masterGainRef.current!);
    source.start();
    nodesRef.current.set(type, { source: source as AudioBufferSourceNode, gain });
  }, [getAudioCtx, createNoise, masterMuted]);

  const stopSound = useCallback((type: SoundType) => {
    const node = nodesRef.current.get(type);
    if (node) {
      node.gain.gain.linearRampToValueAtTime(0, audioCtxRef.current!.currentTime + 0.3);
      setTimeout(() => {
        try { node.source.stop(); } catch {}
        nodesRef.current.delete(type);
      }, 350);
    }
  }, []);

  const toggleChannel = useCallback((idx: number) => {
    setChannels(prev => {
      const next = [...prev];
      const ch = { ...next[idx] };
      ch.active = !ch.active;
      next[idx] = ch;
      if (ch.active) startSound(ch.type, ch.volume);
      else stopSound(ch.type);
      return next;
    });
  }, [startSound, stopSound]);

  const updateVolume = useCallback((idx: number, vol: number) => {
    setChannels(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], volume: vol };
      const node = nodesRef.current.get(next[idx].type);
      if (node && !masterMuted) {
        node.gain.gain.linearRampToValueAtTime(vol, audioCtxRef.current!.currentTime + 0.1);
      }
      return next;
    });
  }, [masterMuted]);

  // Master mute
  useEffect(() => {
    channels.forEach(ch => {
      const node = nodesRef.current.get(ch.type);
      if (node && audioCtxRef.current) {
        node.gain.gain.linearRampToValueAtTime(
          masterMuted ? 0 : ch.volume,
          audioCtxRef.current.currentTime + 0.2
        );
      }
    });
  }, [masterMuted, channels]);

  const saveNeteaseUrl = () => {
    setSavedUrl(neteaseUrl);
    localStorage.setItem('netease-embed-url', neteaseUrl);
  };

  // Extract netease playlist/song ID for embed
  const getEmbedSrc = (url: string) => {
    // Support formats: playlist?id=xxx, song?id=xxx, or direct ID
    const playlistMatch = url.match(/playlist[?/].*?id=(\d+)/);
    const songMatch = url.match(/song[?/].*?id=(\d+)/);
    if (playlistMatch) return `https://music.163.com/outchain/player?type=0&id=${playlistMatch[1]}&auto=0&height=430`;
    if (songMatch) return `https://music.163.com/outchain/player?type=2&id=${songMatch[1]}&auto=0&height=66`;
    // Try raw ID
    const idMatch = url.match(/^(\d+)$/);
    if (idMatch) return `https://music.163.com/outchain/player?type=0&id=${idMatch[1]}&auto=0&height=430`;
    return '';
  };

  const hasActiveSound = channels.some(c => c.active);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded Panel */}
      {expanded && (
        <div className="w-72 rounded-2xl border border-border bg-card/95 shadow-xl backdrop-blur-lg animate-fade-up overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab('noise')}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
                tab === 'noise' ? 'text-foreground bg-muted/50' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🌿 白噪音
            </button>
            <button
              onClick={() => setTab('music')}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
                tab === 'music' ? 'text-foreground bg-muted/50' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🎵 网易云音乐
            </button>
          </div>

          {tab === 'noise' ? (
            <div className="p-4 space-y-3">
              {channels.map((ch, i) => (
                <div key={ch.type} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleChannel(i)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
                      ch.active
                        ? 'bg-nature-green text-secondary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {ch.icon}
                  </button>
                  <span className="w-8 text-xs text-muted-foreground">{ch.name}</span>
                  <Slider
                    value={[ch.volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => updateVolume(i, v / 100)}
                    className="flex-1"
                    disabled={!ch.active}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">粘贴网易云歌单或歌曲链接</label>
                <div className="flex gap-2">
                  <input
                    value={neteaseUrl}
                    onChange={e => setNeteaseUrl(e.target.value)}
                    placeholder="歌单/歌曲链接或ID"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={saveNeteaseUrl}
                    className="rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground transition-all active:scale-95 hover:bg-primary/90"
                  >
                    加载
                  </button>
                </div>
              </div>
              {savedUrl && getEmbedSrc(savedUrl) ? (
                <div className="overflow-hidden rounded-lg">
                  <iframe
                    src={getEmbedSrc(savedUrl)}
                    width="100%"
                    height={savedUrl.includes('song') ? '86' : '430'}
                    frameBorder="0"
                    className="border-0"
                    allow="autoplay"
                  />
                </div>
              ) : savedUrl ? (
                <p className="text-xs text-destructive">无法识别链接，请粘贴网易云音乐歌单或歌曲链接</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  示例：https://music.163.com/playlist?id=123456
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <div className="flex items-center gap-2">
        {hasActiveSound && (
          <button
            onClick={() => setMasterMuted(!masterMuted)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg border border-border transition-all duration-200 hover:shadow-xl active:scale-95"
          >
            {masterMuted ? <VolumeX size={16} className="text-muted-foreground" /> : <Volume2 size={16} className="text-nature-green" />}
          </button>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 ${
            hasActiveSound ? 'bg-nature-green text-secondary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {expanded ? <ChevronDown size={18} /> : <Music size={18} />}
        </button>
      </div>
    </div>
  );
};

export default AmbientSound;
