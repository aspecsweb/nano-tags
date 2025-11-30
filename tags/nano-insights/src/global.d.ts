/*=============*/
/* global.d.ts */
/*=============*/

/* Global type declarations to allow TypeScript and JSX to recognize <nano-insights> */
/* without requiring framework-specific type dependencies.*/

interface HTMLNanoInsightsElement extends HTMLElement {
  projectKey?: string;
}

declare global {
  interface HTMLElementTagNameMap {
    "nano-insights": HTMLNanoInsightsElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      "nano-insights": HTMLNanoInsightsElement;
    }
  }
}

export {};
