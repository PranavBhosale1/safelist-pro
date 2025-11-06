// types/playwright-extra-plugin-stealth.d.ts
declare module 'playwright-extra-plugin-stealth' {
  import { Plugin } from 'playwright-extra';
  const stealthPlugin: () => Plugin;
  export default stealthPlugin;
}
