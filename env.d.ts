/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WINMALE_OPEN_APPID?: string;
  readonly VITE_WINMALE_OPEN_BASE?: string;
  readonly VITE_PRO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
