import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false, // GitHub Pages用にSPAモードに設定
  
  // GitHub Pages用の設定
  basename: process.env.NODE_ENV === 'production' ? '/mtg-setup-helper' : '/',
} satisfies Config;
