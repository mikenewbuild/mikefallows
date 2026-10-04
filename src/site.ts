export const site = {
  title: 'Mike Fallows',
  url: 'https://mikefallows.com',
  language: 'en-GB',
  description: 'The personal website of a designer slash developer.',
  author: {
    name: 'Mike Fallows',
    url: 'https://mikefallows.com/about/',
  },
  feed: {
    subtitle: 'Full feed of posts on mikefallows.com',
    path: '/feed/feed.xml',
  },
  jsonFeed: {
    path: '/feed/feed.json',
  },
  nav: [
    { title: 'Archive', href: '/posts/' },
    { title: 'About', href: '/about/' },
    { title: 'Search', href: '/search/' },
  ],
  popularPosts: [
    'laravel-sail-vite-ssl-custom-domain',
    'using-postcss-and-autoprefixer-with-esbuild',
    'observing-cart-changes-in-a-shopify-theme',
    'responsive-images-in-shopify-themes',
    'making-a-shopify-theme-app-extension-for-google-site-verification',
    'adding-robots-txt-to-eleventy-site',
  ],
};
