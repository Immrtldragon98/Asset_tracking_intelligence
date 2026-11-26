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
