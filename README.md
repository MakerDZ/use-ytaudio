<div align="center">

# use-ytaudio

A lightweight React hook around the YouTube IFrame API that keeps the video hidden while you control audio playback entirely from your UI.

</div>

## Features

- 🎧 Audio-only playback with the official YouTube player under the hood  
- 🎛️ Full control surface (play, pause, stop, seek, volume) through a simple hook API  
- 📼 Playlist support with `next`, `prev`, and `load` helpers  
- 🔁 Optional loop + autoplay flags  
- ⚛️ Safe to use in React Strict Mode (single iframe instance)

## Installation

```bash
pnpm add use-ytaudio
# or
npm install use-ytaudio
# or
yarn add use-ytaudio
```

## Basic Usage

```tsx
import { useYTAudio } from "use-ytaudio";

export default function Player() {
  const {
    containerRef,
    play,
    pause,
    stop,
    isReady,
    currentTime,
    duration
  } = useYTAudio({
    url: "https://www.youtube.com/watch?v=bwB9EMpW8eY",
    autoplay: false,
    initialVolume: 70
  });

  return (
    <div>
      {/* Hidden YouTube iframe */}
      <div ref={containerRef} style={{ width: 0, height: 0, overflow: "hidden" }} />

      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={stop}>Stop</button>

      {isReady && (
        <p>
          {currentTime.toFixed(1)} / {duration.toFixed(1)}
        </p>
      )}
    </div>
  );
}
```

## Playlist Example

```tsx
const player = useYTAudio({
  playlist: [
    "https://www.youtube.com/watch?v=bwB9EMpW8eY",
    "https://www.youtube.com/watch?v=xo1VInw-SKc",
    "https://www.youtube.com/watch?v=tGv7CUutzqU"
  ],
  autoplay: false,
  loop: false
});

player.play();
player.next();
player.prev();
```

## API Overview

`useYTAudio(config)`

### Config

| Option          | Type                 | Default | Description                               |
| --------------- | -------------------- | ------- | ----------------------------------------- |
| `url`           | `string`             | `""`    | Single YouTube video URL or ID            |
| `playlist`      | `string[]`           | `[]`    | Array of URLs/IDs (overrides `url`)       |
| `autoplay`      | `boolean`            | `false` | Start playing as soon as media loads      |
| `initialVolume` | `number (0-100)`     | `50`    | Initial player volume                     |
| `loop`          | `boolean`            | `false` | Loop the current track when it ends       |

### Returned values

- `containerRef` – attach to an empty `div`; the hidden iframe mounts there  
- State: `isReady`, `isPlaying`, `isStopped`, `isError`, `currentTime`, `duration`, `volume`, `currentIndex`, `total`  
- Controls: `play`, `pause`, `stop`, `seek(seconds)`, `setVolume(percent)`, `next`, `prev`, `load(input, startIndex?)`

## Demo

👉 Live demo: [use-ytaudio.vercel.app](https://use-ytaudio.vercel.app/)

To run locally:

```bash
pnpm install
pnpm --filter example dev
```

## Troubleshooting

YouTube can decline to initialize the iframe API in certain environments:

- Incognito / private browsing mode  
- VPNs or proxies that mask your IP  
- Hardened browser profiles or extensions blocking third-party scripts

**Fixes:** disable VPN, switch back to a normal window, and refresh. YouTube requires a trusted client IP to bootstrap the player.  

---

Built with ❤️  by zed