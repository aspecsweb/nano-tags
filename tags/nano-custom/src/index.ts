/*============*/
/*  index.ts  */
/*============*/

import { LitElement } from "lit";
import { property, customElement } from "lit/decorators.js";
import "./global.d";
import { track } from "./track";

export { track };

/**
 * The nano-custom tag enables custom event tracking by exposing a global trackEvent method
 * and listening for custom events on the window. Events are sent to the NanoSights API
 * along with the projectKey and the sessionId for analytics purposes.
 */

// Assign `track` to window global for browser environments
if (typeof window !== "undefined") {
  // Attach the track function to the window object
  // (do not overwrite if already set)
  if (!window.track) {
    window.track = track;
  }
}

@customElement("nano-custom")
export class NanoCustom extends LitElement {
  @property({ type: String }) projectKey: string | null = "";

  private sessionId: string;

  constructor() {
    super();
    this.sessionId =
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("nanoCustomSessionId")) ||
      (typeof crypto !== "undefined" &&
        crypto.randomUUID &&
        crypto.randomUUID()) ||
      Math.random().toString(36).slice(2);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("nanoCustomSessionId", this.sessionId);
    }

    window.nanoCustom = {
      trackEvent: this.trackEvent.bind(this),
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      "nanoCustomEvent",
      this.handleCustomEvent as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "nanoCustomEvent",
      this.handleCustomEvent as EventListener
    );
  }

  private handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{
      eventName: string;
      eventData?: Record<string, any>;
    }>;

    this.trackEvent(customEvent.detail.eventName, customEvent.detail.eventData);
  };

  // Exposed for global API
  trackEvent(eventName: string, eventData?: Record<string, any>) {
    this.sendToApi({
      event_name: eventName,
      event_data: eventData || {},
    });
  }

  private sendToApi(data: Record<string, unknown>) {
    if (!this.projectKey) {
      console.error("No project key provided for nano-custom");
      return;
    }

    fetch("https://www.nanosights.dev/api/tags/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectKey: this.projectKey,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href,
        page_title: document.title,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    });
  }
}
