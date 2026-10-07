# Asset Tracking Intelligence

Plant-wide maintenance and asset intelligence platform. The original Digital Stand Register is now the first mature module inside a reusable asset-intelligence core.

## Registers

- DSIR — Digital Stand Intelligent Register — Finishing Mill stands, campaigns, components, entry guides, life and reliability.
- RMIR — Roughing Mill Intelligent Register — 5 roughing-mill stands and connected gearboxes, floating shafts, couplers, motors, drives and screw shafts.
- MIR — Motor Intelligent Register — plant-wide motor identity, maintenance, operating and failure history.
- DIR — Drive Intelligent Register — plant-wide drive identity, trips, health, maintenance and failure history.
- SSIR — Screw Shaft Intelligent Register — plant-wide screw-shaft lifecycle, maintenance, life and failure history.

## Common Asset Intelligence Core

The platform is not five separate applications. All registers use the same asset identity, relationship, lifecycle, maintenance, event/failure, life/reliability and intelligence foundation.

Example relationship:

RM Stand 3 -> Gearbox 3 -> Floating Shaft 3 -> Coupler 3 -> Motor 3 -> Drive 3 -> Screw Shaft 3

The current DSIR data model and workflows remain intact while new asset types are introduced through the common registry.

## RMIR baseline

The migration creates 5 Roughing Mill stands and 5 each of gearboxes, floating shafts, couplers, motors, drives and screw shafts. It deliberately does not invent manufacturer, model, installation dates, operating hours or failure history.

## Existing DSIR capabilities retained

- 3 finishing-mill running lines and stand lifecycle tracking
- Stand preparation and installation workflow
- Stand changes and campaign history
- Stand life in running hours
- Entry-guide tracking
- Inventory and append-only inventory transactions
- PM/activity logging
- Historical reliability and process observations
- Maintenance report parsing with validation
- Knowledge/document foundations
- Investigation and campaign intelligence

## New API

GET /api/v1/assets/modules — register catalog
GET /api/v1/assets/overview — plant-wide asset counts
GET /api/v1/assets/{module_code} — assets for a register

Existing DSIR endpoints remain unchanged.

## Local development

docker compose up --build -d

Frontend: http://localhost:3000
API: http://localhost:8000
API docs: http://localhost:8000/docs
