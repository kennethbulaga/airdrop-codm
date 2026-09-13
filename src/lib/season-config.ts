export interface SeasonConfig {
  seasonNumber: string;
  title: string;
  badgeText: string;
  themeName: string;
  announcementText: string;
  backgroundImage: string;
  accentColor: string;
  blogUrl: string;
}

export const CURRENT_SEASON: SeasonConfig = {
  seasonNumber: 'S8',
  title: 'Season 8 — Against All Fate',
  badgeText: 'Season 8',
  themeName: 'Honkai Impact 3rd Collaboration',
  announcementText: 'Against All Fate • Honkai Impact 3rd Collab',
  backgroundImage: '/season8-bg.png',
  accentColor: '#0071E3',
  blogUrl: 'https://www.callofduty.com/blog/2026/09/call-of-duty-mobile-season-8-against-all-fate',
};
