/*=============*/
/* index.ts    */
/*=============*/

import { LitElement } from "lit";
import { property, customElement } from "lit/decorators.js";
import "./global.d";

@customElement("nano-analytics")
export class NanoAnalytics extends LitElement {
  @property({ type: String }) projectKey: string | null = "";

  private sessionId: string;

  constructor() {
    super();
    this.sessionId =
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("nanoAnalyticsSessionId")) ||
      (typeof crypto !== "undefined" &&
        crypto.randomUUID &&
        crypto.randomUUID()) ||
      Math.random().toString(36).slice(2);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("nanoAnalyticsSessionId", this.sessionId);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.trackPageView();
    window.addEventListener("popstate", this.trackPageView.bind(this));
    window.addEventListener(
      "nanoAnalyticsEvent",
      this.trackEvent.bind(this) as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.trackPageView.bind(this));
    window.removeEventListener(
      "nanoAnalyticsEvent",
      this.trackEvent.bind(this) as EventListener
    );
  }

  private trackPageView = () => {
    this.sendToApi({
      eventType: "page_view",
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  };

  private trackEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ name: string; data: unknown }>;
    this.sendToApi({
      eventType: customEvent.detail.name,
      event_data: customEvent.detail.data,
    });
  };

  private sendToApi(data: Record<string, unknown>) {
    fetch("https://www.nanosights.dev/api/tags/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectKey: this.projectKey,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ...data,
      }),
    });
  }
}
