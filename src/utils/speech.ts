import { audioManager } from './audio';

type SpeechCallback = (text: string, isFinal: boolean) => void;

class SpeechEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: SpeechCallback | null = null;
  private animFrameId: number | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR'; // Portuguese (Brazil) as default

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (this.onResultCallback) {
          if (final.trim()) {
            this.onResultCallback(final.trim(), true);
          } else if (interim.trim()) {
            this.onResultCallback(interim.trim(), false);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech Recognition notice:', event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (_) {}
        }
      };
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  setLanguage(lang = 'pt-BR'): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  startListening(callback: SpeechCallback, lang = 'pt-BR'): boolean {
    if (!this.recognition) return false;
    this.onResultCallback = callback;
    this.recognition.lang = lang;
    this.isListening = true;
    try {
      this.recognition.start();
      return true;
    } catch (_) {
      return true;
    }
  }

  stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }

  // Primary speech synthesizer: Uses Fish Audio as default for all system speech
  async speak(
    text: string,
    voiceId: string = '82d13948027e4be69892dd3d0104e681',
    onEnd?: () => void,
    onViseme?: (level: number) => void
  ): Promise<void> {
    const cleanText = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (!cleanText) {
      onEnd?.();
      return;
    }

    this.stopSpeaking();

    // 1. Try Fish Audio neural TTS API (default for the whole system)
    try {
      const resp = await fetch('/api/tts/fishaudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceId: voiceId || '82d13948027e4be69892dd3d0104e681',
        }),
      });

      if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        if (buffer && buffer.byteLength > 200) {
          await audioManager.playAudioBuffer(buffer, onEnd, onViseme);
          return;
        }
      }
    } catch (err) {
      console.warn('[Speech] Fish Audio indisponível, usando sintetizador local:', err);
    }

    // 2. Fallback: Browser Web Speech API SpeechSynthesis
    this.speakBrowserFallback(cleanText, onEnd, onViseme);
  }

  private speakBrowserFallback(
    cleanText: string,
    onEnd?: () => void,
    onViseme?: (level: number) => void
  ): void {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;
    utterance.lang = 'pt-BR';

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    let isSpeaking = true;
    const animateMouth = () => {
      if (!isSpeaking) {
        onViseme?.(0);
        return;
      }
      const time = performance.now() * 0.015;
      const level = Math.max(0, Math.sin(time) * 0.6 + Math.cos(time * 2.3) * 0.3 + 0.3);
      onViseme?.(Math.min(1.0, level));
      this.animFrameId = requestAnimationFrame(animateMouth);
    };

    utterance.onstart = () => {
      isSpeaking = true;
      animateMouth();
    };

    utterance.onend = () => {
      isSpeaking = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      onViseme?.(0);
      onEnd?.();
    };

    utterance.onerror = () => {
      isSpeaking = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      onViseme?.(0);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    audioManager.stopCurrentAudio();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

export const speechEngine = new SpeechEngine();
