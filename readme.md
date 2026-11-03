# ⚙️ MARK LVI (56) — React Edition

An autonomous cross-platform voice AI assistant and tactical operations HUD rewritten as a high-performance React application with Vite, TypeScript, Tailwind CSS, and Web Audio / Speech APIs.

---

## 🚀 Key Features Ported & Re-architected

- **🧑‍🎤 3D Holographic Head Avatar & Arc Reactor HUD Canvas**:
  - Anatomical wireframe head rendering with natural eye saccades, blinking, and emotion shifts.
  - Real-time lip-sync derived from audio vocal amplitude and phoneme schedules.
  - Concentric rotating HUD gyro rings, targeting reticle brackets, degree compass ticks, and audio frequency visualizer.
  - Status expressions: `IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `SLEEPING`.

- **⚡ Instant Acknowledgment & Outcome Honesty**:
  - Immediate vocal confirmation before asynchronous tool execution.
  - Precise tool outcome assertions: `done`, `unverified`, `failed`, `ask`, and `started`.

- **🔌 Modular 4-Slot Engine & Providers**:
  - **① Hearing (STT)**: Whisper Neural Recognizer, WebSpeech API, or Cloud Whisper.
  - **② Thinking (LLM)**: Gemini 3.1 Flash Live, local Ollama (127.0.0.1:11434), OpenAI, or DeepSeek/Groq.
  - **③ Speaking (TTS)**: Piper Neural Voice (~52 languages), System voices, or ElevenLabs.
  - Real-time **TEST** buttons with latency profiling on every slot.
  - Tool Budget strategies: Unlimited (45 tools / 56k chars) vs Balanced vs Compact (for local 8B models).
  - Private reasoning filter (`<think>` blocks stripped from qwen3/deepseek-r1).

- **🧠 Recallable Memory Matrix**:
  - Multi-category persistent knowledge store (`identity`, `preferences`, `projects`, `relationships`, `wishes`, `notes`).
  - Searchable memory items with updated timestamps, single-click deletion, and manual fact commitment.
  - Prompt Core budget indicators.

- **🎧 Audio Hardware Routing**:
  - Live microphone selection with animated VU peak volume meter.
  - Speaker output selection with synthesized audible tone test.
  - Dedicated output volume slider.

- **🎨 Dynamic Retheming & Hue Wheel**:
  - Real-time whole-app teal-family palette hue derivation.
  - Preset themes (Stark Arc Cyan, Mark LVI Gold, S.H.I.E.L.D. Emerald, War Machine Ruby, Wakanda Royal Violet, Stealth Monolith) and custom hex color wheel.
  - Native Gemini voice selector (Puck, Charon, Kore, Fenrir, Aoede).

- **⚠️ Security Confirmation Gate**:
  - Safety countdown banner for irreversible actions (shutdown, restart, WiFi network disconnect).
  - Enforces human confirmation before execution.

- **📱 Remote Mobile Pairing & Encryption**:
  - QR Code scanner interface for smartphone pairing.
  - 8-character pairing code with simulated PBKDF2 200,000 rounds derivation and AES-256-GCM badge.

- **📊 Hardware Telemetry & Directives**:
  - Real-time CPU, RAM, GPU, Net I/O, and Core Temperature indicators.
  - Grounded Search, Weather, Flight Tracker, HUD Video player, and File Ingestion dynamic cards.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Futuristic HUD Design System
- **Icons**: Lucide React
- **Audio & Speech**: Web Audio API `AudioContext` / `AnalyserNode`, Web Speech API `SpeechRecognition` & `SpeechSynthesis`
