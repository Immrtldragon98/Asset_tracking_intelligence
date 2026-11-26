# Asset Tracking Intelligence: workspace decisions

Date: 26 November 2026.
Status: accepted by the user; implementation in PR #3, not deployed.

| Decision | Choice | Benefit | Cost / evidence to monitor |
| --- | --- | --- | --- |
| Primary user | Maintenance / shift engineer | Puts equipment exceptions, readiness and work first | Management trends require a separate overview later |
| Shell | Primary icon rail + collapsible secondary sidebar | Stable workspace switching with more width during monitoring | More navigation concepts; observe reopening and wrong-workspace selection |
| Discovery | Plant -> Line -> Equipment | Matches physical walkdowns and location-based coordination | Incomplete locations become visible commissioning work |

## Routine implementation choices

The current Next.js/Tailwind stack and existing domain write APIs are retained. Shared components handle queries, read-panel states and inspectors. There is no new component framework or microservice split in this change.

## Boundaries

- FMIR is the existing Digital Stand Register.
- Assets, installation positions and dated installations retain their current identities/history.
- Unknown line locations stay unassigned; no assignment is inferred from asset codes.
- Registers are alternate views. A future reviewed identity backfill must link legacy DSR records to asset_registry; the layout change does not claim that migration is finished.
- Critical writes require server acknowledgement. Optimistic final stock/readiness/installation states are not used.
- Live diagnostics require sensor evidence. This implementation displays saved condition and maintenance records.
