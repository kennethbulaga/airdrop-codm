export type ItemCategory = 'sensitivity' | 'hud' | 'graphics';

export type DeviceType = 'Phone' | 'iPad / Tablet';

export type GripType = '2-Finger Thumbs' | '3-Finger' | '4-Finger Claw' | '5+ Finger';

export type GameMode = 'Battle Royale' | 'Multiplayer';

export type AccelerationType = 'Fixed Speed' | 'Distance Accel' | 'Speed Accel';

export type Playstyle = 'Rusher' | 'Sniper' | 'All-Rounder';

export interface TelemetrySpecs {
  camera: number;
  ads: number;
  gyroAds?: number;
  acceleration: AccelerationType;
}

export interface PostRecord {
  id: string;
  user_id?: string | null;
  category: ItemCategory;
  creator_name: string;
  creator_avatar_url?: string | null;
  team_name?: string | null;
  is_verified?: boolean;
  social_platform?: 'YouTube' | 'TikTok' | 'Facebook' | 'Twitch' | 'X';
  social_url?: string | null;
  social_handle?: string | null;
  code: string;
  season: string;
  mode: GameMode;
  playstyle?: Playstyle | null;
  device_name?: string | null;
  device_type: DeviceType;
  grip?: GripType | null;
  gyro?: boolean | null;
  tier?: string | null;
  fps_target?: string | null;
  image_url?: string | null;
  layout_highlight?: string | null;
  description?: string | null;
  specs?: TelemetrySpecs | null;
  upvotes: number;
  is_hidden?: boolean;
  report_count?: number;
  created_at: string;
  trending_score?: number;
}

export type SortOption = 'trending' | 'top' | 'latest';

export interface FilterState {
  category: ItemCategory;
  sort: SortOption;
  device: DeviceType | null;
  mode: GameMode | null;
  playstyle: Playstyle | null;
  grip: GripType | null;
  gyro: boolean | null;
  tier?: string | null;
  fpsTarget?: string | null;
  searchQuery: string;
}

export interface UserSessionProfile {
  id: string;
  email?: string;
  name: string;
  avatarUrl?: string;
}
