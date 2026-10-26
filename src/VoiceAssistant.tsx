
import { useCallback, useEffect, useRef, useState } from "react";

type CallStatus = "idle" | "calling" | "connected" | "ended" | "error";

type TranscriptLine = {
  id: number;
  speaker: "You" | "Sudaiss AI";
  text: string;
};

const FRIENDLY_ERROR =
  "The call could not connect. Check your microphone permission and try again.";

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

function resampleTo16k(input: Float32Array, sourceRate: number) {
  if (sourceRate === INPUT_SAMPLE_RATE) return input;

  const outputLength = Math.floor(
    (input.length * INPUT_SAMPLE_RATE) / sourceRate
  );
  const output = new Float32Array(outputLength);
  const ratio = sourceRate / INPUT_SAMPLE_RATE;

  for (let i = 0; i < outputLength; i++) {
    const position = i * ratio;
    const left = Math.floor(position);
    const right = Math.min(left + 1, input.length - 1);
    const fraction = position - left;

    output[i] =
      input[left] * (1 - fraction) + input[right] * fraction;
  }

  return output;
}

function floatToPcm16(input: Float32Array) {
  const output = new Int16Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    output[i] =
      sample < 0 ? sample * 32768 : sample * 32767;
  }

  return output;
}

function pcmToBase64(pcm: Int16Array) {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = "";
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function base64ToPcm(base64: string): Int16Array {
  const binary = atob(base64);
  const len = binary.length - (binary.length % 2);
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Int16Array(bytes.buffer, 0, len / 2);
}

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [message, setMessage] = useState("");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const transcriptIdRef = useRef(0);
  const currentTranscriptIdRef = useRef<number | null>(null);
  const currentTranscriptSpeakerRef =
    useRef<TranscriptLine["speaker"] | null>(null);
  const cancelledRef = useRef(false);
  const setupCompleteRef = useRef(false);
  const nextPlaybackTimeRef = useRef(0);
  const playbackSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const ringbackRef = useRef<{ stop: () => void } | null>(null);
  const turnActiveRef = useRef(false);

  // Lightweight diagnostics for audio transport and session performance (no sensitive data logged)
  const diagnosticsRef = useRef({
    sessionStartTime: 0,
    chunksReceived: 0,
    totalAudioDuration: 0,
    underrunCount: 0,
    interruptionCount: 0,
    lastChunkTime: 0,
  });

  const stopRingback = useCallback(() => {
    if (ringbackRef.current) {
      try {
        ringbackRef.current.stop();
      } catch {
        // Audio graph or context may already have closed.
      }
      ringbackRef.current = null;
    }
  }, []);

  const startRingback = useCallback(
    (context: AudioContext) => {
      stopRingback();

      if (context.state === "closed") return;

      let isStopped = false;
      let timerId: number | null = null;
      let currentNodes: {
        osc1: OscillatorNode;
        osc2: OscillatorNode;
        gain: GainNode;
      } | null = null;

      const playRingBurst = () => {
        if (isStopped || context.state === "closed") return;

        try {
          const osc1 = context.createOscillator();
          const osc2 = context.createOscillator();
          const burstGain = context.createGain();

          osc1.type = "sine";
          osc1.frequency.value = 440; // North American / international dual-tone ringback (440Hz + 480Hz)
          osc2.type = "sine";
          osc2.frequency.value = 480;

          const now = context.currentTime;
          burstGain.gain.setValueAtTime(0, now);
          burstGain.gain.linearRampToValueAtTime(0.06, now + 0.08); // 80ms gentle attack
          burstGain.gain.setValueAtTime(0.06, now + 1.5);
          burstGain.gain.linearRampToValueAtTime(0, now + 1.6); // 100ms smooth release

          osc1.connect(burstGain);
          osc2.connect(burstGain);
          burstGain.connect(context.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.65);
          osc2.stop(now + 1.65);

          currentNodes = { osc1, osc2, gain: burstGain };

          // Standard cadence: 1.6s ring burst followed by 2.2s pause (3.8s total cycle)
          timerId = window.setTimeout(() => {
            playRingBurst();
          }, 3800);
        } catch {
          // Audio graph or context was closed
        }
      };

      playRingBurst();

      ringbackRef.current = {
        stop: () => {
          isStopped = true;
          if (timerId !== null) {
            window.clearTimeout(timerId);
            timerId = null;
          }
          if (currentNodes) {
            try {
              const now = context.currentTime;
              currentNodes.gain.gain.cancelScheduledValues(now);
              currentNodes.gain.gain.setValueAtTime(
                currentNodes.gain.gain.value,
                now
              );
              currentNodes.gain.gain.linearRampToValueAtTime(0, now + 0.03);
              currentNodes.osc1.stop(now + 0.05);
              currentNodes.osc2.stop(now + 0.05);
            } catch {
              // Nodes may already have ended
            }
            currentNodes = null;
          }
        },
      };
    },
    [stopRingback]
  );

  const addTranscript = useCallback(
    (speaker: TranscriptLine["speaker"], text: string) => {
      if (!text) return;

      setTranscript((current) => {
        const existingId = currentTranscriptIdRef.current;
        const sameSpeaker =
          currentTranscriptSpeakerRef.current === speaker;

        if (existingId !== null && sameSpeaker) {
          const index = current.findIndex((line) => line.id === existingId);

          if (index !== -1) {
            const updated = [...current];
            const prev = updated[index].text;
            const needsSpace =
              prev.length > 0 &&
              !prev.endsWith(" ") &&
              !text.startsWith(" ") &&
              !/^[.,!?;:]/.test(text);

            updated[index] = {
              ...updated[index],
              text: prev + (needsSpace ? " " : "") + text,
            };
            return updated.slice(-12);
          }
        }

        const id = ++transcriptIdRef.current;
        currentTranscriptIdRef.current = id;
        currentTranscriptSpeakerRef.current = speaker;

        return [
          ...current,
          { id, speaker, text: text.trim() },
        ].slice(-12);
      });
    },
    []
  );

  const finishTranscriptTurn = useCallback(() => {
    currentTranscriptIdRef.current = null;
    currentTranscriptSpeakerRef.current = null;
  }, []);

  const stopPlayback = useCallback(() => {
    playbackSourcesRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // The source may already have finished.
      }
    });

    playbackSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;
    turnActiveRef.current = false;
  }, []);

  const endCall = useCallback(
    (nextStatus: CallStatus = "ended") => {
      cancelledRef.current = true;
      setupCompleteRef.current = false;
      turnActiveRef.current = false;
      stopRingback();

      try {
        if (processorRef.current) {
          processorRef.current.onaudioprocess = null;
          processorRef.current.disconnect();
        }

        sourceRef.current?.disconnect();

        streamRef.current?.getTracks().forEach((track) => track.stop());

        stopPlayback();

        const socket = socketRef.current;
        socketRef.current = null;

        if (
          socket &&
          (socket.readyState === WebSocket.OPEN ||
            socket.readyState === WebSocket.CONNECTING)
        ) {
          socket.close();
        }

        const context = audioContextRef.current;
        audioContextRef.current = null;

        if (context && context.state !== "closed") {
          void context.close().catch(() => {
            // Audio context cleanup is best-effort.
          });
        }
      } catch {
        // Always release what we can if the call has already closed.
      }

      processorRef.current = null;
      sourceRef.current = null;
      streamRef.current = null;

      const diag = diagnosticsRef.current;
      if (diag.sessionStartTime > 0) {
        const durationSec = ((Date.now() - diag.sessionStartTime) / 1000).toFixed(1);
        console.log(
          `[VoiceAssistant] Session summary: duration=${durationSec}s, chunks=${diag.chunksReceived}, audioDuration=${diag.totalAudioDuration.toFixed(1)}s, underruns=${diag.underrunCount}, interrupts=${diag.interruptionCount}`
        );
        diag.sessionStartTime = 0;
      }

      setStatus(nextStatus);

      if (nextStatus === "ended") {
        setMessage("Call ended. Thanks for visiting.");
      }
    },
    [stopPlayback, stopRingback]
  );

  const playAudioChunk = useCallback((base64: string) => {
    stopRingback();
    const context = audioContextRef.current;

    if (!context || context.state === "closed") return;

    // Wake context if suspended by browser idle power-saving
    if (context.state === "suspended") {
      void context.resume();
    }

    try {
      const pcm = base64ToPcm(base64);
      if (pcm.length === 0) return;

      const audioBuffer = context.createBuffer(
        1,
        pcm.length,
        OUTPUT_SAMPLE_RATE
      );
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < pcm.length; i++) {
        channelData[i] = pcm[i] / 32768;
      }

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);

      const currentTime = context.currentTime;
      const diag = diagnosticsRef.current;
      diag.chunksReceived++;
      diag.totalAudioDuration += audioBuffer.duration;
      diag.lastChunkTime = performance.now();

      let startAt: number;
      const isQueueDry = nextPlaybackTimeRef.current < currentTime;

      if (!turnActiveRef.current) {
        // Brand new conversation response turn: prime with a 160ms pre-roll jitter cushion.
        // If audio from a previous turn is still playing, ensure we queue after it cleanly without overlap.
        turnActiveRef.current = true;
        startAt = Math.max(currentTime + 0.16, nextPlaybackTimeRef.current);
      } else if (!isQueueDry) {
        // Continuous chaining during an active response: sample-accurate seamless connection
        startAt = nextPlaybackTimeRef.current;
      } else {
        // Buffer underrun recovery (network/generation jitter caused playback queue to empty).
        // Re-prime with a 140ms cushion to give subsequent incoming chunks runway to arrive,
        // preventing the recurring 8ms stutter death-spiral.
        diag.underrunCount++;
        startAt = currentTime + 0.14;
        console.debug(
          `[VoiceAssistant] Buffer underrun re-primed (+140ms). Total underruns: ${diag.underrunCount}`
        );
      }

      nextPlaybackTimeRef.current = startAt + audioBuffer.duration;
      playbackSourcesRef.current.push(source);

      source.onended = () => {
        try {
          source.disconnect();
        } catch {
          // Best-effort cleanup
        }
        playbackSourcesRef.current =
          playbackSourcesRef.current.filter((item) => item !== source);
      };

      source.start(startAt);
    } catch (error) {
      console.error("Could not play the assistant audio.", error);
    }
  }, [stopRingback]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      setupCompleteRef.current = false;
      stopRingback();

      try {
        if (processorRef.current) {
          processorRef.current.onaudioprocess = null;
          processorRef.current.disconnect();
        }

        sourceRef.current?.disconnect();
        streamRef.current?.getTracks().forEach((track) => track.stop());

        socketRef.current?.close();

        playbackSourcesRef.current.forEach((source) => {
          try {
            source.stop();
          } catch {
            // Already stopped.
          }
        });

        if (audioContextRef.current) {
          void audioContextRef.current.close();
        }
      } catch {
        // Release browser resources when the component unmounts.
      }
    };
  }, [stopRingback]);

  const startCall = async () => {
    if (status === "calling" || status === "connected") return;

    cancelledRef.current = false;
    setupCompleteRef.current = false;
    diagnosticsRef.current = {
      sessionStartTime: Date.now(),
      chunksReceived: 0,
      totalAudioDuration: 0,
      underrunCount: 0,
      interruptionCount: 0,
      lastChunkTime: 0,
    };
    finishTranscriptTurn();
    setStatus("calling");
    setMessage("Requesting microphone access…");
    setTranscript([]);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone access requires HTTPS or localhost in a supported browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (cancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Your browser does not support audio processing.");
      }

      const context = new AudioContextClass();
      audioContextRef.current = context;
      await context.resume();

      // Begin subtle telephone ringback tone while waiting for the voice service to connect
      startRingback(context);

      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;

      // ScriptProcessorNode is used here for a straightforward prototype.
      // AudioWorklet is a better option for a later production refinement.
      const processor = context.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const socket = socketRef.current;

        if (
          !setupCompleteRef.current ||
          !socket ||
          socket.readyState !== WebSocket.OPEN
        ) {
          return;
        }

        const input = event.inputBuffer.getChannelData(0);

        // Continuous linear streaming: preserve quiet speech and allow browser WebRTC AEC
        // (Acoustic Echo Cancellation) to maintain a stable adaptive filter without non-linear drops.
        const resampled = resampleTo16k(input, context.sampleRate);
        const pcm = floatToPcm16(resampled);

        try {
          socket.send(
            JSON.stringify({
              realtimeInput: {
                audio: {
                  data: pcmToBase64(pcm),
                  mimeType: "audio/pcm;rate=16000",
                },
              },
            })
          );
        } catch (error) {
          console.error("Could not send microphone audio.", error);
        }
      };

      source.connect(processor);
      // Keep the processor active without playing microphone audio to speakers.
      const silentGain = context.createGain();
      silentGain.gain.value = 0;
      processor.connect(silentGain);
      silentGain.connect(context.destination);

      const protocol =
        window.location.protocol === "https:" ? "wss:" : "ws:";
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const socketUrl = isLocal
        ? `${protocol}//${window.location.hostname}:3001/api/live`
        : `${protocol}//${window.location.host}/api/live`;

      setMessage("Connecting to Sudaiss AI…");

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelledRef.current) {
          socket.close();
          return;
        }

        setMessage("Connected to the voice service. Preparing audio…");
      };

      socket.onmessage = (event) => {
        if (typeof event.data !== "string") return;

        try {
          const data = JSON.parse(event.data) as {
            setupComplete?: unknown;
            error?: { message?: string };
            serverContent?: {
              modelTurn?: {
                parts?: Array<{
                  inlineData?: {
                    data?: string;
                    mimeType?: string;
                  };
                }>;
              };
              inputTranscription?: { text?: string };
              outputTranscription?: { text?: string };
              interrupted?: boolean;
              turnComplete?: boolean;
            };
          };

          if (data.error) {
            stopRingback();
            console.error("Gemini Live error:", data.error.message);
            setMessage(
              data.error.message ||
                "The voice service returned an error. Please try again."
            );
            endCall("error");
            return;
          }

          if (data.setupComplete) {
            stopRingback();
            setupCompleteRef.current = true;
            setStatus("connected");
            setMessage("Connected — you can speak naturally.");
            return;
          }

          const content = data.serverContent;
          if (!content) return;

          if (content.inputTranscription?.text) {
            addTranscript("You", content.inputTranscription.text);
          }

          if (content.outputTranscription?.text) {
            addTranscript("Sudaiss AI", content.outputTranscription.text);
          }

          if (content.interrupted) {
            diagnosticsRef.current.interruptionCount++;
            console.log(
              `[VoiceAssistant] Speech interrupted by user input (interruption #${diagnosticsRef.current.interruptionCount}).`
            );
            stopPlayback();
          }

          const parts = content.modelTurn?.parts || [];

          for (const part of parts) {
            const audio = part.inlineData;

            if (
              audio?.data &&
              audio.mimeType?.toLowerCase().includes("audio/pcm")
            ) {
              playAudioChunk(audio.data);
            }
          }

          if (content.turnComplete) {
            turnActiveRef.current = false;
            finishTranscriptTurn();
          }
        } catch (error) {
          console.error("Could not process a voice response.", error);
        }
      };

      socket.onerror = () => {
        stopRingback();
        if (cancelledRef.current) return;

        setMessage(
          "Unable to connect to the voice service. Check that your backend is running."
        );
      };

      socket.onclose = (event) => {
        stopRingback();
        console.log(
          `[VoiceAssistant] WebSocket connection closed [code: ${event.code}, reason: ${event.reason || "none"}, clean: ${event.wasClean}]`
        );
        if (cancelledRef.current) return;

        setMessage("The voice connection closed. Please try again.");
        endCall("error");
      };
    } catch (error) {
      stopRingback();
      if (cancelledRef.current) return;

      console.error("Voice assistant connection failed:", error);

      const detail = error instanceof Error ? error.message : FRIENDLY_ERROR;

      if (
        detail.includes("Permission") ||
        detail.includes("NotAllowed") ||
        detail.includes("denied")
      ) {
        setMessage(
          "Microphone permission was denied. Allow microphone access and try again."
        );
      } else if (
        detail.includes("NotFound") ||
        detail.includes("DevicesNotFound")
      ) {
        setMessage("No microphone was found. Connect a microphone and retry.");
      } else {
        setMessage(FRIENDLY_ERROR);
      }

      endCall("error");
    }
  };

  const closePanel = () => {
    stopRingback();
    if (status === "calling" || status === "connected") {
      endCall("ended");
    }

    setIsOpen(false);
  };

  const isActive = status === "calling" || status === "connected";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Call Sudaiss AI voice assistant"
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-1 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-300 sm:bottom-7 sm:right-7"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950">
          <PhoneIcon />
        </span>
        <span className="pr-1 text-left">
          <span className="block text-sm font-bold">Talk to Sudaiss AI</span>
          <span className="block text-xs text-slate-300">
            Real-time voice assistant
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePanel();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sudaiss-voice-title"
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-amber-100 bg-[#fcfaf5] p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
          >
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close voice assistant"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <CloseIcon />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-slate-950 shadow-inner">
                {status === "connected" ? <WaveIcon /> : <PhoneIcon large />}
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
                Personal AI assistant
              </p>

              <h2
                id="sudaiss-voice-title"
                className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950"
              >
                Sudaiss AI
              </h2>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600">
                Ask about my background, development work, cybersecurity
                journey, or a project you have in mind.
              </p>

              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === "connected"
                      ? "animate-pulse bg-emerald-500"
                      : status === "calling"
                        ? "animate-pulse bg-amber-500"
                        : status === "error"
                          ? "bg-red-500"
                          : "bg-slate-300"
                  }`}
                />
                {status === "calling"
                  ? "Calling / connecting…"
                  : status === "connected"
                    ? "Call connected"
                    : status === "error"
                      ? "Connection failed"
                      : status === "ended"
                        ? "Call ended"
                        : "Ready when you are"}
              </div>

              <p
                aria-live="polite"
                className="mt-3 min-h-10 text-sm leading-5 text-slate-600"
              >
                {message || "Tap Start Call to allow microphone access and begin."}
              </p>

              {transcript.length > 0 && (
                <div className="mt-4 max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-left">
                  {transcript.map((line) => (
                    <div key={line.id}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {line.speaker}
                      </p>
                      <p className="mt-0.5 text-sm leading-5 text-slate-700">
                        {line.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-3">
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => void startCall()}
                    className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-300"
                  >
                    <PhoneIcon />
                    {status === "error" || status === "ended"
                      ? "Call Again"
                      : "Start Call"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => endCall("ended")}
                    className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
                  >
                    <PhoneOffIcon />
                    {status === "calling" ? "Cancel Call" : "End Call"}
                  </button>
                )}
              </div>

              <p className="mt-5 text-[11px] leading-5 text-slate-400">
                Your microphone is used only for the voice session. The
                assistant is AI, not a human caller. Avoid sharing sensitive
                personal information.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function PhoneIcon({ large = false }: { large?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={large ? "h-9 w-9" : "h-5 w-5"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.2 18a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 8.7a16 16 0 0 0 6 6l1.25-1.25a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function PhoneOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18M10.6 5.1c.5.1 1 .2 1.5.4a2 2 0 0 1 1.1 2.1l-.3 1.6m3.6 3.6 1.4-.2a2 2 0 0 1 2.1 1.1c.2.5.3 1 .4 1.5M6.4 6.4A20 20 0 0 0 4.8 8.7a16 16 0 0 0 6 6c.7-.6 1.3-1.1 1.9-1.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      className="h-10 w-10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M8 20v8M16 13v22M24 7v34M32 14v20M40 20v8" />
    </svg>
  );
}
