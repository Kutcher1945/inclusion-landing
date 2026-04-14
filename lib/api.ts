const BASE = "http://127.0.0.1:8000";

export type Overview = {
  total_objects: number;
  total_hotels: number;
  total_hostels: number;
  total_bus_stops: number;
  by_status: { status__name_ru: string | null; count: number }[];
  by_delivery_status: { delivery_status__name_ru: string | null; count: number }[];
};

export type AdaptationStats = {
  adaptation_levels: {
    fully_adapted: number;
    highly_adapted: number;
    moderately_adapted: number;
    poorly_adapted: number;
    not_adapted: number;
  };
  average_adaptation_percentage: number;
  total_objects_analyzed: number;
  total_adapted_parameters: number;
  total_possible_parameters: number;
};

export type DistrictStat = {
  district__id: number | null;
  district__name_ru: string | null;
  district__name_kz: string | null;
  total_objects: number;
  state_owned: number;
  private_owned: number;
  adapted_objects: number;
  total_services: number | null;
  services_for_disabled: number | null;
};

export type ActivityTypeStat = {
  type_of_activity__id: number | null;
  type_of_activity__name_ru: string | null;
  type_of_activity__name_kz: string | null;
  total_objects: number;
  total_services: number | null;
  services_for_disabled: number | null;
  avg_floors: number | null;
};

export type AccessibilityStats = {
  wheelchair_accessible: number;
  hearing_accessible:    number;
  vision_accessible:     number;
  motor_accessible:      number;
  wheelchair_partial:    number;
  hearing_partial:       number;
  vision_partial:        number;
  motor_partial:         number;
  fully_accessible:      number;
  fully_partial:         number;
  not_accessible:        number;
};

export type MapPoint = {
  id: number;
  name: string;
  address: string;
  type: string | null;
  district: string | null;
  k: string | null;
  o: string | null;
  s: string | null;
  z: string | null;
  status: "accessible" | "partial" | "inaccessible" | "unknown";
  lat?: number;
  lng?: number;
};

export type MapData = {
  points: MapPoint[];
  no_coords: MapPoint[];
  total: number;
  with_coords: number;
  without_coords: number;
};

export type TrendPoint = { date: string; count: number };
export type Trends = {
  created_objects: TrendPoint[];
  updated_objects: TrendPoint[];
  period: string;
  start_date: string;
  end_date: string;
};

export type KozsCategory = {
  label: string;
  accessible: number;
  partial: number;
  inaccessible: number;
  total: number;
  pct_accessible: number;
  pct_partial: number;
  by_passport: {
    objects:  { accessible: number; partial: number; total: number };
    hotels:   { accessible: number; partial: number; total: number };
    hostels:  { accessible: number; partial: number; total: number };
    stops:    { accessible: number; partial: number; total: number };
  };
};

export type KozsBreakdown = {
  label: string;
  distribution: Record<string, number>;
  with_assessment: number;
};

export type AdaptationBreakdown = {
  levels: { fully: number; highly: number; moderately: number; poorly: number; none: number };
  average_pct: number;
  total: number;
};

export type DistrictKozs = {
  district__name_ru: string | null;
  total: number;
  k_access: number;
  o_access: number;
  s_access: number;
  z_access: number;
};

export type ActivityKozs = {
  type_of_activity__name_ru: string | null;
  total: number;
  k_access: number;
  o_access: number;
  s_access: number;
  z_access: number;
  k_partial: number;
  o_partial: number;
  s_partial: number;
  z_partial: number;
};

export type ActivityKozsDetail = ActivityKozs & {
  sub_type_of_activity__name_ru: string | null;
};

export type DeepAccessibility = {
  summary: {
    total_all: number;
    total_objects: number;
    total_hotels: number;
    total_hostels: number;
    total_stops: number;
    total_entrances: number;
  };
  kozs: {
    kreslo: KozsCategory;
    opordvig: KozsCategory;
    sluh: KozsCategory;
    zrenie: KozsCategory;
  };
  objects: {
    total: number;
    kozs: { kreslo: KozsBreakdown; opordvig: KozsBreakdown; sluh: KozsBreakdown; zrenie: KozsBreakdown };
    adaptation: AdaptationBreakdown;
    by_district: DistrictKozs[];
    by_activity: ActivityKozs[];
    by_activity_detail: ActivityKozsDetail[];
  };
  hotels: {
    total: number;
    kozs: { kreslo: KozsBreakdown; opordvig: KozsBreakdown; sluh: KozsBreakdown; zrenie: KozsBreakdown };
    adaptation: AdaptationBreakdown;
  };
  hostels: {
    total: number;
    kozs: { kreslo: KozsBreakdown; opordvig: KozsBreakdown; sluh: KozsBreakdown; zrenie: KozsBreakdown };
    adaptation: AdaptationBreakdown;
  };
  stops: {
    total: number;
    kozs: { kreslo: KozsBreakdown; opordvig: KozsBreakdown; sluh: KozsBreakdown; zrenie: KozsBreakdown };
  };
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export const api = {
  overview:       () => get<Overview>("/inclusion-api/analytics/overview/"),
  adaptation:     () => get<AdaptationStats>("/inclusion-api/analytics/adaptation_stats/"),
  byDistrict:     () => get<DistrictStat[]>("/inclusion-api/analytics/by_district/"),
  byActivityType: () => get<ActivityTypeStat[]>("/inclusion-api/analytics/by_activity_type/"),
  accessibility:  () => get<AccessibilityStats>("/inclusion-api/analytics/accessibility_by_disability_type/"),
  trends:            (period = "month") => get<Trends>(`/inclusion-api/analytics/trends/?period=${period}`),
  deepAccessibility: () => get<DeepAccessibility>("/inclusion-api/analytics/deep_accessibility/"),
  mapPoints:         () => get<MapData>("/inclusion-api/analytics/map_points/"),
  exportUrl:         () => `${BASE}/inclusion-api/analytics/export_all_activities/`,
};
