export interface IOPMLItem {
    text: string,
    title: string,
    description: string,
    xmlUrl: string,
    type: string,
    selected: boolean
}

export const suggestFeeds: Array<IOPMLItem>  = [
  {
    text: 'The Verge -  All Posts',
    title: 'The Verge -  All Posts',
    description: '',
    xmlUrl: 'https://www.theverge.com/rss/index.xml',
    type: 'rss',
    selected: false
  },
  {
    text: 'World news | The Guardian',
    title: 'World news | The Guardian',
    description: 'Latest World news news, comment and analysis from the Guardian, the world\'s leading liberal voice',
    xmlUrl: 'https://www.theguardian.com/world/rss',
    type: 'rss',
    selected: false
  },
  {
    text: 'Polygon -  All',
    title: 'Polygon -  All',
    description: '',
    xmlUrl: 'https://www.polygon.com/rss/index.xml',
    type: 'rss',
    selected: false
  },
  {
    text: 'Deutsche Welle',
    title: 'Deutsche Welle - EN All',
    description: 'Deutsche Welle',
    xmlUrl: 'https://rss.dw.com/rdf/rss-en-all',
    type: 'rss',
    selected: false
  }
];
