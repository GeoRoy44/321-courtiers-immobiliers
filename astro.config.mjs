import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://321courtierimmobilier.fr',
  integrations: [sitemap()],
  output: 'static',
  compressHTML: true,
});
