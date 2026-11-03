class AudioManager {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isListeningToMic: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private ttsAnimFrame: number | null = null;

  public getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  async startMic(deviceId?: string): Promise<boolean> {
    try {
      this.stopMic();
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.micStream = stream;
      const ctx = this.getContext();
      const source = ctx.createMediaStreamSource(stream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isListeningToMic = true;
      return true;
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      this.isListeningToMic = false;
      return false;
    }
  }

  stopMic(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.isListeningToMic = false;
  }

  getMicLevel(): number {
    if (!this.isListeningToMic || !this.analyser || !this.dataArray) {
      return 0;
    }
    this.analyser.getByteFrequencyData(this.dataArray as any);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    // Normalize 0..1
    return Math.min(1.0, avg / 128);
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(32);
    }
    this.analyser.getByteFrequencyData(this.dataArray as any);
    return this.dataArray;
  }

  async playAudioBuffer(
    buffer: ArrayBuffer,
    onEnd?: () => void,
    onViseme?: (level: number) => void
  ): Promise<void> {
    this.stopCurrentAudio();
    const ctx = this.getContext();
    try {
      // Clone buffer to avoid detachment issues
      const cloned = buffer.slice(0);
      const decoded = await ctx.decodeAudioData(cloned);
      const source = ctx.createBufferSource();
      source.buffer = decoded;

      if (!this.analyser) {
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
      }

      source.connect(this.analyser);
      this.analyser.connect(ctx.destination);
      this.currentSource = source;

      const tempArray = new Uint8Array(this.analyser.frequencyBinCount);
      let isPlaying = true;

      const trackViseme = () => {
        if (!isPlaying || !this.analyser) return;
        this.analyser.getByteFrequencyData(tempArray as any);
        let sum = 0;
        for (let i = 0; i < tempArray.length; i++) {
          sum += tempArray[i];
        }
        const level = Math.min(1.0, (sum / tempArray.length) / 96);
        onViseme?.(level);
        this.ttsAnimFrame = requestAnimationFrame(trackViseme);
      };

      source.onended = () => {
        isPlaying = false;
        if (this.ttsAnimFrame) cancelAnimationFrame(this.ttsAnimFrame);
        onViseme?.(0);
        this.currentSource = null;
        onEnd?.();
      };

      source.start(0);
      trackViseme();
    } catch (e) {
      console.warn('Audio buffer decode failure:', e);
      onEnd?.();
    }
  }

  stopCurrentAudio(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (_) {}
      this.currentSource = null;
    }
    if (this.ttsAnimFrame) {
      cancelAnimationFrame(this.ttsAnimFrame);
      this.ttsAnimFrame = null;
    }
  }

  playTestTone(frequency = 440, duration = 0.5): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Tone generation error:', e);
    }
  }
}

export const audioManager = new AudioManager();
