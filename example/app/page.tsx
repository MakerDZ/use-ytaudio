"use client";

import { useState } from "react";
import { useYTAudio } from "use-ytaudio";
import { Highlight, themes } from "prism-react-renderer";
import Link from "next/link";
import Image from "next/image";

const SINGLE_URL = "https://www.youtube.com/watch?v=bwB9EMpW8eY";
const PLAYLIST_URLS = [
  "https://www.youtube.com/watch?v=bwB9EMpW8eY",
  "https://www.youtube.com/watch?v=xo1VInw-SKc",
  "https://www.youtube.com/watch?v=tGv7CUutzqU"
];

type Tab = "single" | "playlist";

export default function App() {
  const [tab, setTab] = useState<Tab>("single");

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full justify-center px-4 md:px-6">
      {/* framed container */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 border-x border-border bg-card/80 px-4 py-14 sm:px-6 md:px-10 md:py-16">
        {/* corner diamonds */}
        <div className="bg-background absolute -right-[16.5px] -bottom-[16.5px] z-20 flex size-8 items-center justify-center">
          <div className="size-2 rotate-45 rounded-[2px] border border-border" />
        </div>
        <div className="bg-background absolute -bottom-[16.5px] -left-[16.5px] z-20 flex size-8 items-center justify-center">
          <div className="size-2 rotate-45 rounded-[2px] border border-border" />
        </div>

        <Link href="https://github.com/MakerDZ" target="_blank">
          <div className="flex items-center gap-2 flex-row">
            <Image src="https://avatars.githubusercontent.com/u/87943692" alt="Zed" width={32} height={32} className="rounded-full size-8" />
            <span className="text-foreground text-sm font-medium underline">By Zed</span>
          </div>
        </Link>

        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            useYTAudio
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
            React hook for YouTube audio
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Hook into the YouTube IFrame API, keep the video hidden, and build
            your own audio player UI with simple state and controls.
          </p>
        </header>

       
        <CodeBlock
          code={`pnpm add use-ytaudio`}
          language="bash"
          title="Installation"
        />

        {/* Tabs + content */}
        <main className="flex flex-col gap-6">
          {/* Tab menu */}
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center rounded-full border border-border bg-muted p-1 text-xs w-fit">
              <button
                onClick={() => setTab("single")}
                className={
                  "rounded-full px-4 py-1.5 transition " +
                  (tab === "single"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Single example
              </button>
              <button
                onClick={() => setTab("playlist")}
                className={
                  "rounded-full px-4 py-1.5 transition " +
                  (tab === "playlist"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Playlist example
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Switch between examples. Both use the same hook API.
            </p>
          </div>

          {tab === "single" ? <SingleExampleCard /> : <PlaylistExampleCard />}
        </main>
      </div>
    </div>
  );
}

type PlayerProps = ReturnType<typeof useYTAudio>;

function StatusPanel({
  isReady,
  isPlaying,
  isStopped,
  isError,
  currentTime,
  duration
}: PlayerProps) {
  return (
    <div className="space-y-0.5 text-[11px] text-muted-foreground">
      <p>Ready: {String(isReady)}</p>
      <p>Playing: {String(isPlaying)}</p>
      <p>Stopped: {String(isStopped)}</p>
      <p>Error: {String(isError)}</p>
      <p className="pt-1">
        Time: {currentTime.toFixed(1)} / {duration.toFixed(1)}
      </p>
    </div>
  );
}

function Controls({
  play,
  pause,
  stop,
  seek,
  duration,
  currentTime,
  volume,
  setVolume
}: PlayerProps) {
  return (
    <div className="space-y-3 text-[11px]">
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={play}
          className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
        >
          Play
        </button>
        <button
          onClick={pause}
          className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
        >
          Pause
        </button>
        <button
          onClick={stop}
          className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
        >
          Stop
        </button>
      </div>

      <div className="space-y-1">
        <div>Volume ({volume})</div>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-1">
        <div>Seek</div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          step={0.1}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
    </div>
  );
}

/* --- Single example card --- */

function SingleExampleCard() {
  const single = useYTAudio({
    url: SINGLE_URL,
    autoplay: false,
    initialVolume: 70
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 md:p-7">
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold sm:text-lg">Single track</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          One YouTube URL, hidden video, your own audio UI.
        </p>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground sm:text-xs">
        Track:{" "}
        <a
          href={SINGLE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          {SINGLE_URL}
        </a>
      </div>

      {/* Hidden iframe */}
      <div ref={single.containerRef} className="h-0 w-0 overflow-hidden" />

      <div className="mt-5 space-y-4">
        <StatusPanel {...single} />
        <Controls {...single} />
        <DocsBoxSingle />
      </div>
    </section>
  );
}

/* --- Playlist example card --- */

function PlaylistExampleCard() {
  const playlist = useYTAudio({
    playlist: PLAYLIST_URLS,
    autoplay: false,
    initialVolume: 50,
    loop: false
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 md:p-7">
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold sm:text-lg">Playlist</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Pass an array of URLs and move between tracks.
        </p>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground sm:text-xs">
        <p className="mb-1">Tracks:</p>
        <ol className="list-decimal space-y-0.5 pl-4">
          {PLAYLIST_URLS.map((url, idx) => (
            <li
              key={url}
              className={
                idx === playlist.currentIndex
                  ? "font-semibold text-primary"
                  : ""
              }
            >
              {idx + 1}.{" "}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {url}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Hidden iframe */}
      <div ref={playlist.containerRef} className="h-0 w-0 overflow-hidden" />

      <div className="mt-5 space-y-4">
        <StatusPanel {...playlist} />

        <p className="text-[11px] text-muted-foreground sm:text-xs">
          Track {playlist.currentIndex + 1} / {playlist.total}
        </p>

        <div className="flex gap-2 text-xs">
          <button
            onClick={playlist.prev}
            className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
          >
            Prev
          </button>
          <button
            onClick={playlist.next}
            className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
          >
            Next
          </button>
        </div>

        <Controls {...playlist} />
        <DocsBoxPlaylist />
      </div>
    </section>
  );
}

/* --- Reusable syntax-highlighted code block --- */




export function CodeBlock({
  code,
  language = "tsx",
  title = "Example"
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  return (
    <div
      className="
        rounded-xl border border-[var(--border)]
        bg-[var(--card)] text-[var(--foreground)]
        shadow-sm overflow-hidden
      "
    >
      {/* Header */}
      <div
        className="
          flex items-center justify-between
          border-b border-[var(--border)]
          px-3 py-2
          bg-[var(--background)]
        "
      >
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          {/* macOS dots */}
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </span>
          <span className="ml-2 font-medium">{title}</span>
        </div>

        <span
          className="
            rounded-md bg-[var(--muted)]
            text-[10px] px-2 py-0.5 uppercase tracking-wide text-[var(--muted-foreground)]
          "
        >
          {language}
        </span>
      </div>

      {/* Syntax highlight */}
      <Highlight code={code.trim()} language={language as any} theme={themes.github}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="
              m-0 p-4 text-[11px] leading-relaxed font-mono
              overflow-x-auto whitespace-pre
              bg-[#fbfbfb]
            "
            style={{
              ...style,
              backgroundColor: "#fbfbfb", // hard override
            }}
          >
            {tokens.map((line, i) => (
              <div
                key={i}
                {...getLineProps({ line })}
                className="table-row"
              >
                <span className="table-cell pr-4 select-none text-[var(--muted-foreground)]">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span
                      key={key}
                      {...getTokenProps({ token })}
                    />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}



/* --- Docs boxes using CodeBlock --- */

function DocsBoxSingle() {
  const code = `function SinglePlayer() {
  const {
    containerRef,
    isReady,
    play,
    pause,
    stop,
    currentTime,
    duration,
    volume,
    setVolume,
  } = useYTAudio({
    url: "${SINGLE_URL}",
    autoplay: false,
    initialVolume: 70,
  });

  return (
    <div>
      <div ref={containerRef} className="h-0 w-0 overflow-hidden" />
      {/* your UI here */}
    </div>
  );
}`;

  return (
    <CodeBlock
      title="Minimal example (single)"
      code={code}
      language="tsx"
    />
  );
}

function DocsBoxPlaylist() {
  const code = `function PlaylistPlayer() {
  const {
    containerRef,
    currentIndex,
    total,
    play,
    pause,
    next,
    prev,
  } = useYTAudio({
    playlist: [
      "https://www.youtube.com/watch?v=bwB9EMpW8eY",
      "https://www.youtube.com/watch?v=xo1VInw-SKc",
      "https://www.youtube.com/watch?v=tGv7CUutzqU",
    ],
    autoplay: false,
  });

  return (
    <div>
      <div ref={containerRef} className="h-0 w-0 overflow-hidden" />
      {/* your UI here */}
    </div>
  );
}`;

  return (
    <CodeBlock
      title="Minimal example (playlist)"
      code={code}
      language="tsx"
    />
  );
}
