# Release Status — Asset Tracking Intelligence

## Platform pivot completed

- Product identity changed from Digital Stand Register to Asset Tracking Intelligence
- DSIR retained as the mature Finishing Mill register
- Added shared asset_registry model with parent/child relationships
- Added Asset Intelligence Core API
- Added plant-wide register home screen
- Added RMIR baseline for 5 Roughing Mill stands
- Added 5 gearboxes, floating shafts, couplers, motors, drives and screw shafts
- Added reusable register screens for DSIR/RMIR/MIR/DIR/SSIR
- Existing DSIR lifecycle, inventory, PM, history and intelligence modules retained

## RMIR plant data still required

The baseline contains identity and relationships only. Plant commissioning should provide actual asset/tag numbers, manufacturer/model, installation dates, rated power/speed where relevant, operating hours, criticality, maintenance/failure history, and confirmation of physical relationships.

## Next engineering phase

1. Connect maintenance and event history to generic asset IDs.
2. Add MIR/DIR/SSIR commissioning forms.
3. Add RMIR stand/gearbox/shaft/coupler/motor/drive detail pages.
4. Extend the Maintenance Assistant to traverse parent/child assets.
5. Add cross-asset investigation and comparison.
6. Add production-safe authentication and expanded automated tests.
