# Performance traces

Recorded by `pnpm perf:trace` against a production build (`next start`) in headless Chrome with **4× CPU throttling**, viewport 1400×900. Each `*.trace.json.gz` loads into Chrome DevTools → Performance → Load profile. The SVG is the frames track drawn from `requestAnimationFrame` deltas during the same recording.

| Sequence | Frames | Avg | p95 | Max | Frames over 25 ms | Layout events | Paint events |
| --- | --- | --- | --- | --- | --- | --- | --- |
| overview-scroll | 300 | 16.67 ms | 16.7 ms | 16.8 ms | 0 | 11 | 41 |
| table-resort | 171 | 18.81 ms | 33.4 ms | 116.6 ms | 11 | 36 | 398 |

Recorded 2026-09-07.
