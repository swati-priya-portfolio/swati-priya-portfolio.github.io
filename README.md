# audio/

Drop the focus track here as **`bye-bye-bye.mp3`** and the player on the
"Music while designing" board will play it.

- The file name must match exactly: `audio/bye-bye-bye.mp3`
- Any format the browser accepts works (`.mp3` and `.m4a` are safest).
  If you use a different extension, update the `src` on the
  `<audio class="player-audio">` element in `index.html`.
- Keep it small — a couple of MB. It is set to `preload="none"`, so nothing
  downloads until someone presses play.
- It never autoplays. It loops, at 55% volume.

With no file here the player still animates, silently, and screen readers
are told the track is unavailable rather than that music is playing.

Two notes before this goes live on a public site:

1. *Bye Bye Bye* is a commercial recording. Streaming it from your own
   portfolio is a public performance of someone else's master — fine for a
   local demo, but it is the kind of thing that draws a takedown. A short
   royalty-free loop, or just leaving the player as the silent prop it is
   today, avoids that entirely.
2. `images/album-art.png` is the label in the middle of the record. Swap
   that file for whatever you want spinning there — a Deadpool still, the
   NSYNC sleeve, anything. Save it **square** (512x512 is plenty); it is
   cropped to a circle and sits at 60% of the disc, so keep the subject's
   face near the centre or the crop will cut it.

While the track plays, the 28 bars beside it are driven by the track's own
frequency data through a Web Audio analyser — they really are following the
beat, not looping an animation. With no file present they fall back to a
simulated envelope so the widget still looks alive.
