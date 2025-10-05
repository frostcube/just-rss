import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'feed',
        loadComponent: () =>
          import('../feed/feed.page').then((m) => m.FeedPage),
      },
      {
        path: 'sources',
        loadComponent: () =>
          import('../sources/sources.page').then((m) => m.SourcesPage),
      },
      {
        path: 'discover',
        loadComponent: () =>
          import('../discover/discover.page').then((m) => m.DiscoverPage),
      },
      {
        path: 'saved',
        loadComponent: () =>
          import('../saved/saved.page').then((m) => m.SavedPage),
      },
      {
        path: '',
        redirectTo: '/tabs/feed',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/feed',
    pathMatch: 'full',
  },
];
