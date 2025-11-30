/*=============*/
/* global.d.ts */
/*=============*/

/* Global type declarations to allow TypeScript and JSX to recognize <nano-custom> */
/* without requiring framework-specific type dependencies.*/

import { track } from "./track";

interface HTMLNanoCustomElement extends HTMLElement {
  projectKey?: string;
}

declare global {
  interface HTMLElementTagNameMap {
    "nano-custom": HTMLNanoCustomElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      "nano-custom": HTMLNanoCustomElement;
    }
  }
  interface Window {
    nanoCustom: {
      trackEvent: (eventName: string, eventData?: Record<string, any>) => void;
    };
    track: typeof track;
  }
}

export {};
