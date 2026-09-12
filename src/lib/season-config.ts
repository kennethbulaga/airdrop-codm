export interface SeasonConfig {
  seasonNumber: string;
  title: string;
  badgeText: string;
  themeName: string;
  backgroundImage: string;
  accentColor: string;
}

export const CURRENT_SEASON: SeasonConfig = {
  seasonNumber: 'S8',
  title: 'Season 8',
  badgeText: 'Season 8 Battle Royale Meta',
  themeName: 'CODM S8: Honkai Impact 3rd Event',
  backgroundImage: '/season8-bg.png',
  accentColor: '#0071E3',
};
