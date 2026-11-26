# Asset Tracking Intelligence — Architecture

## Platform

Asset Tracking Intelligence is the platform. Registers are domain views over a common asset intelligence core:

- FMIR — Finishing Mill Intelligent Register: the existing Digital Stand Register (DSR)
- RMIR — Roughing Mill Intelligent Register
- MIR — Motor Intelligent Register
- DIR — Drive Intelligent Register
- SSIR — Screw Shaft Intelligent Register

## Common asset model

The asset_registry table provides reusable identity:

- asset code/name and type
- register/module
- plant, equipment, area and position
- manufacturer/model
- installation date
- status/location
- operating and lifetime hours
- criticality and notes
- parent/child relationship

## Roughing Mill relationship

Roughing Mill -> Stand -> Gearbox / Entry Guide / Motor / Floating Shaft / Coupler (GB Side) / Coupler (Motor Side)

MIR and SSIR will later expose richer subtrees: Motor -> Bearings / Coupler / Sensors, and Screw Shaft -> Bearing 1 / Bearing 2. DIR equipment will be added when the plant list is provided.

The parent/child model is generic so later equipment can be attached without creating a new schema for every machine.

## Backend

Route -> Service/Repository -> Model -> PostgreSQL

The existing FastAPI, SQLAlchemy and Alembic DSR stack is retained. The Asset Intelligence Core is exposed under /api/v1/assets.

## Plant platform and equipment workspaces

Asset Tracking Intelligence is the whole-plant platform. DSR is the equipment-specific application for Finishing Mill stands; FMIR is that same DSR workspace inside this platform. It is not a new stand database or a replacement workflow.

- `/dashboard`: plant overview, register selector and WRM 1–3 Finishing Mill installation summary.
- `/fmir`: full DSR home, including all line/position installations and links to preparation, stand changes, entry guides, maintenance, spares, insights and history.
- `/dsir`: compatibility redirect to `/fmir`.
- `/asset-intelligence/dsir` and `/asset-intelligence/fmir`: compatibility entry points to `/fmir`.
- Existing DSR routes and write APIs stay in place, preserving the ledger and transaction validation.
- RMIR/MIR/DIR/SSIR remain equipment views over the shared asset core. An asset should retain a single identity even when viewed through different registers.

The original DSR layout is the reference: a persistent left sidebar, grouped workflows, line/position overview and matching mobile drawer/quick navigation. The register selector changes the equipment context; Plant overview returns to the whole-plant scope.

`frontend/lib/navigation.ts` owns register and workflow destinations for the sidebar, FMIR home and command search. Shared maintenance/reliability pages carry register context in `?module=`. Routes receive the common shell by default, with `/login` explicitly standalone.

### Compatibility and data ownership

The user-facing name is FMIR. The persisted module code remains `DSIR` for existing assets, reliability records and maintenance schedules. Presentation helpers translate FMIR to/from this code. The Asset Core's read endpoints accept FMIR as an alias for DSIR; no table copies, bulk renaming or history migration are required.

The Finishing Mill summary loads `/api/v1/dashboard/`, which derives current installations from the existing DSR ledger. The previous static running-config list is not the source for this view. Installed lineup does not establish machine operating state. Existing `campaign_hours` in this service is calendar elapsed time and must be labelled as calendar age, not measured runtime.

## Application layers

Use the DSR structure throughout the plant platform:

- Frontend: routes/screens -> feature components -> API client.
- Backend: HTTP routes -> domain services -> repositories -> SQLAlchemy models/PostgreSQL.
- Alembic owns schema evolution; shared identity does not bypass equipment-specific workflow rules.
- Inventory balances and append-only inventory transactions retain their existing write boundary.

## Intelligence direction

The future assistant should use controlled tools over the shared model:

- get asset
- get parent/children
- get maintenance history
- get events/failures
- get life
- compare assets
- get asset relationship tree
- investigate equipment relationship
- compare positions and connected equipment

LLMs must not write directly to the database. The existing validation/human-confirmation pattern remains the write boundary.


## Engineer-first workspace decisions (26 November 2026)

Accepted product decisions:
1. Maintenance/shift engineers are the primary users.
2. A narrow primary workspace rail sits beside a collapsible workflow sidebar.
3. Plant -> Line -> Equipment is the default discovery path; registers are alternate views.

### Route responsibilities

| Route | Workspace pattern | Primary task |
| --- | --- | --- |
| /dashboard | KPI ribbon + exception/work grid | Review recorded issues, spare readiness and next jobs |
| /equipment | Location-filtered master-detail | Find equipment at a position and inspect its recorded identity/relationships |
| /fmir | DSR equipment workspace | Operate the Finishing Mill register without duplicating its data |
| /stand-area | Readiness board, with stage-list option | Complete validated preparation steps |
| /operations | Installed-position grid + inspector | Record a stand change with server confirmation |
| /inventory | Data grid + inspector | Compare spares and record explicit stock transactions |
| /maintenance | Filterable master-detail + planning inspector | Review scope, responsibility and time windows |

### Shared frontend boundaries

- navigation.ts supplies workflow destinations; the primary rail switches workspaces and the secondary sidebar carries register/line context.
- useWorkspaceQuery owns shareable filters and selected IDs. The URL, including browser Back/Forward, restores the equipment, job, stock item and readiness view.
- useWorkspaceResource owns independently loaded read panels, errors, retry and response ordering.
- Inspector owns focus, Escape, scroll locking and consistent slide-over presentation.
- Domain forms retain their existing APIs and validation. Stock quantities are a separate confirmed transaction, not an ordinary metadata edit.
- Backend permissions remain authoritative. Viewer mode hides/disables mutation controls but is not the security boundary.

### Shared catalog read architecture

GET /api/v1/assets/catalog -> AssetCatalogService -> AssetCatalogRepository -> asset_registry.
The repository reads once and the service exposes recorded fields without claiming an ACTIVE asset is running. No line assignment is derived from an asset tag, a stand number or the static running-config lists. An explicitly recorded parent location can supply an assembly's display context; traversal is cycle-safe.

The equipment explorer combines views of the existing DSR installation ledger and shared registry without copying either dataset. Source IDs remain separate. The missing legacy-to-registry identity bridge is still engineering debt; this UI does not merge records by matching text codes.

### Evidence and transactions

Line installations establish a lineup. Calendar elapsed time is not measured runtime. Condition flags are recorded observations, not live telemetry. No synthetic gauges or historical sensor curves are generated.

Inventory writes, stand changes and readiness transitions display pending state until the API acknowledges success. Error responses leave source records unchanged in the UI. Backend transactions/validation continue to decide whether a write is allowed.

### How to evaluate the decisions

During floor trials, measure time to locate an asset, wrong-line selections, time to record a change, unsuccessful saves and how often engineers collapse/reopen the workflow sidebar. Use that evidence to revisit the chosen shell and information priority.
