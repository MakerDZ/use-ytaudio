import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type UseYTAudioConfig = {
  /** Single YouTube URL to play */
  url?: string;
  /** Optional playlist of YouTube URLs */
  playlist?: string[];
  autoplay?: boolean;
  initialVolume?: number; // 0–100
  loop?: boolean; // loop current track when it ends
};

export type UseYTAudioReturn = {
  // attach to a div where the hidden iframe will live
  containerRef: React.RefObject<HTMLDivElement | null>;

  // state
  isReady: boolean;
  isPlaying: boolean;
  isStopped: boolean;
  isError: boolean;
  duration: number;
  currentTime: number;
  volume: number;

  // playlist info
  currentIndex: number;
  total: number;

  // controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  prev: () => void;
  load: (input: string | string[], startIndex?: number) => void;
};

const YT_IFRAME_SRC = "https://www.youtube.com/iframe_api";

let ytApiPromise: Promise<typeof YT> | null = null;

function loadYouTubeIframeAPI(): Promise<typeof YT> {
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("YouTube IFrame API cannot load on server"));
      return;
    }

    // already loaded
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const script = document.createElement("script");
    script.src = YT_IFRAME_SRC;
    script.async = true;

    script.onerror = () => {
      console.error("[useYTAudio] Failed to load YouTube IFrame API");
      reject(new Error("Failed to load YouTube IFrame API"));
    };

    window.onYouTubeIframeAPIReady = () => {
      if (window.YT) {
        resolve(window.YT);
      } else {
        reject(new Error("YT did not initialize"));
      }
    };

    document.head.appendChild(script);
  });

  return ytApiPromise;
}

// supports: https://www.youtube.com/watch?v=..., https://youtu.be/..., /embed/...
function extractVideoId(input: string): string | null {
    // 1) If it looks like a plain ID, accept it
    const idLike = /^[a-zA-Z0-9_-]{11}$/;
    if (idLike.test(input)) {
      return input;
    }
  
    // 2) Otherwise treat as URL
    try {
      const u = new URL(input);
  
      // youtu.be/<id>
      if (u.hostname === "youtu.be") {
        const candidate = u.pathname.slice(1);
        if (idLike.test(candidate)) return candidate;
      }
  
      // youtube.com/watch?v=<id> or variants
      const v = u.searchParams.get("v");
      if (v && idLike.test(v)) {
        return v;
      }
  
      // /embed/<id> or /shorts/<id> etc
      const parts = u.pathname.split("/");
      const last = parts[parts.length - 1];
      if (idLike.test(last)) return last;
  
      return null;
    } catch {
      // input wasn’t a URL and didn’t match ID pattern
      return null;
    }
  }
  

export function useYTAudio(config: UseYTAudioConfig = {}): UseYTAudioReturn {
  const {
    url,
    playlist: initialPlaylist = [],
    autoplay = false,
    initialVolume = 50,
    loop = false
  } = config;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);

  const [playlist, setPlaylist] = useState<string[]>(() => {
    if (initialPlaylist.length > 0) return initialPlaylist;
    return url ? [url] : [];
  });

  const playlistRef = useRef<string[]>(playlist);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [isError, setIsError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);

  // init YouTube player ONCE
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;
    let timeInterval: number | undefined;

    async function init() {
      try {
        // avoid creating multiple players in React StrictMode dev
        if (playerRef.current) return;

        const YT = await loadYouTubeIframeAPI();
        if (!mounted) return;

        if (!containerRef.current) {
          console.error("[useYTAudio] containerRef is null");
          return;
        }

        playerRef.current = new YT.Player(containerRef.current, {
          width: "0",
          height: "0",
          // DO NOT pass videoId here; we load with loadVideoById later
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(initialVolume);
              setVolumeState(initialVolume);
              setIsReady(true);
              setIsStopped(true);
              setIsError(false);
              console.log("[useYTAudio] Player ready");
            },
            onStateChange: (event) => {
              const player = event.target;
              const state = event.data;

              if (state === window.YT?.PlayerState.PLAYING) {
                setIsPlaying(true);
                setIsStopped(false);
                setIsError(false);
              }

              if (state === window.YT?.PlayerState.PAUSED) {
                setIsPlaying(false);
              }

              if (state === window.YT?.PlayerState.ENDED) {
                setIsPlaying(false);
                setCurrentTime(0);

                const list = playlistRef.current;

                if (loop) {
                  player.playVideo();
                } else if (list.length > 1) {
                  setCurrentIndex((idx) =>
                    idx + 1 < list.length ? idx + 1 : idx
                  );
                } else {
                  setIsStopped(true);
                }
              }

              const dur = player.getDuration?.() ?? 0;
              setDuration(dur);

              if (state === window.YT?.PlayerState.PLAYING) {
                if (timeInterval) window.clearInterval(timeInterval);
                timeInterval = window.setInterval(() => {
                  const t = player.getCurrentTime?.() ?? 0;
                  setCurrentTime(t);
                }, 500);
              } else if (timeInterval) {
                window.clearInterval(timeInterval);
                timeInterval = undefined;
              }
            },
            onError: (e) => {
              console.error("[useYTAudio] Player error:", e?.data);
              setIsError(true);
              setIsPlaying(false);
            }
          }
        });
      } catch (err) {
        if (!mounted) return;
        console.error("[useYTAudio] init error:", err);
        setIsError(true);
      }
    }

    void init();

    return () => {
      mounted = false;
      if (timeInterval) window.clearInterval(timeInterval);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // config is assumed stable; if you really need dynamic config, you can add deps
  }, [initialVolume, loop]);

  // load current video when playlist or index changes
  useEffect(() => {
    if (!isReady) return;
    const player = playerRef.current;
    if (!player) return;
    if (playlist.length === 0) return;
    if (currentIndex < 0 || currentIndex >= playlist.length) return;

    const currentUrl = playlist[currentIndex];
    const id = extractVideoId(currentUrl);

    if (!id) {
      console.error(
        "[useYTAudio] Could not extract a valid 11-char video ID from",
        currentUrl
      );
      setIsError(true);
      return;
    }

    console.log("[useYTAudio] Loading video", { url: currentUrl, id });
    setIsError(false);
    setCurrentTime(0);

    player.loadVideoById(id);

    if (!autoplay) {
      player.pauseVideo();
      setIsPlaying(false);
      setIsStopped(false);
    } else {
      setIsPlaying(true);
      setIsStopped(false);
    }
  }, [playlist, currentIndex, autoplay, isReady]);
  

  // controls
  const play = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.playVideo();
  }, []);

  const pause = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.pauseVideo();
  }, []);

  const stop = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.stopVideo();
    setIsPlaying(false);
    setIsStopped(true);
    setCurrentTime(0);
  }, []);

  const seek = useCallback((seconds: number) => {
    const p = playerRef.current;
    if (!p) return;
    const t = Math.max(0, seconds);
    p.seekTo(t, true);
    setCurrentTime(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    const p = playerRef.current;
    if (!p) return;
    const clamped = Math.max(0, Math.min(100, v));
    p.setVolume(clamped);
    setVolumeState(clamped);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((idx) => {
      const list = playlistRef.current;
      if (idx + 1 < list.length) return idx + 1;
      return idx;
    });
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex((idx) => {
      if (idx - 1 >= 0) return idx - 1;
      return idx;
    });
  }, []);

  const load = useCallback((input: string | string[], startIndex = 0) => {
    if (Array.isArray(input)) {
      setPlaylist(input);
      setCurrentIndex(startIndex);
    } else {
      setPlaylist([input]);
      setCurrentIndex(0);
    }
  }, []);

  return {
    containerRef,
    isReady,
    isPlaying,
    isStopped,
    isError,
    duration,
    currentTime,
    volume,
    currentIndex,
    total: playlist.length,
    play,
    pause,
    stop,
    seek,
    setVolume,
    next,
    prev,
    load
  };
}
