export type InstalledStand = {
  id: number; code: string; installed_at?: string | null; campaign_hours?: number | null;
  leakage?: boolean; vibration?: boolean; abnormal_sound?: boolean;
};
export type PlantLine = { id: number; name: string; positions: { id: number; position_number: number; current_stand: InstalledStand | null }[] };
export type CatalogAsset = {
  id: number; asset_code: string; name: string; asset_type: string; module_code: string; parent_id: number | null;
  position: string | null; location: string | null; area: string | null; equipment: string | null;
  manufacturer: string | null; model: string | null; installation_date: string | null; status: string;
  criticality: string; notes: string | null;
};
export const normalizeLine = (value: string) => value.toUpperCase().replace(/[\s_-]/g, "").replace(/^WRMLINE/, "WRM").replace(/^W(?=\d)/, "WRM");
export function assetLine(asset: CatalogAsset, catalog: CatalogAsset[], lines: PlantLine[]): string | null {
  const byId = new Map(catalog.map(row => [row.id, row]));
  const seen = new Set<number>();
  let current: CatalogAsset | undefined = asset;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    // Only match an explicitly recorded location. Never infer a line from a tag or stand number.
    const line = lines.find(row => current?.location && normalizeLine(current.location) === normalizeLine(row.name));
    if (line) return line.name;
    current = current.parent_id == null ? undefined : byId.get(current.parent_id);
  }
  return null;
}
export function assetAncestors(asset: CatalogAsset, catalog: CatalogAsset[]): CatalogAsset[] {
  const result: CatalogAsset[] = [], seen = new Set([asset.id]);
  const byId = new Map(catalog.map(row => [row.id, row]));
  let next = asset.parent_id == null ? undefined : byId.get(asset.parent_id);
  while (next && !seen.has(next.id)) { result.unshift(next); seen.add(next.id); next = next.parent_id == null ? undefined : byId.get(next.parent_id); }
  return result;
}
export function conditionFlags(stand: InstalledStand) {
  return [stand.leakage ? "Leakage" : "", stand.vibration ? "Vibration" : "", stand.abnormal_sound ? "Abnormal sound" : ""].filter(Boolean);
}
