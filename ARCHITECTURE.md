# Asset Tracking Intelligence — Architecture

## Platform

Asset Tracking Intelligence is the platform. Registers are domain views over a common asset intelligence core:

- DSIR — Digital Stand Intelligent Register
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

The existing FastAPI, SQLAlchemy and Alembic DSIR stack is retained. The Asset Intelligence Core is exposed under /api/v1/assets.

## Frontend

The home page is now the plant-wide register selector. Existing DSIR screens remain available at /stand-area and existing operations/history/intelligence routes remain intact.

Generic register screens are available at /asset-intelligence/{module}.

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
