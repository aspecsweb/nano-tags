/*============*/
/*  index.ts  */
/*============*/

import { LitElement } from "lit";
import { property, customElement } from "lit/decorators.js";
import "./global.d";

/**
 * NanoInsights measures performance metrics (Largest Contentful Paint, First Input Delay, Cumulative Layout Shift)
 * and sends them along with the projectKey and the sessionId to the insights endpoint.
 */

// Add these interfaces to fix TypeScript errors
interface PerformanceEntryWithStart extends PerformanceEntry {
  processingStart?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

@customElement("nano-insights")
export class NanoInsights extends LitElement {
  @property({ type: String }) projectKey: string | null = "";

  private sessionId: string;

  constructor() {
    super();
    this.sessionId =
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("nanoInsightsSessionId")) ||
      (typeof crypto !== "undefined" &&
        crypto.randomUUID &&
        crypto.randomUUID()) ||
      Math.random().toString(36).slice(2);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("nanoInsightsSessionId", this.sessionId);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.trackWebVitals();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up any observers if needed
  }

  private trackWebVitals() {
    // Track Core Web Vitals
    this.trackLCP();
    this.trackFID();
    this.trackCLS();

    // Track additional performance metrics
    this.trackTTFB();
    this.trackFCP();
    this.trackNavigationTiming();
  }

  private trackLCP() {
    if (!PerformanceObserver) return;

    // Create an observer for the Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];

      // Report the final LCP value when the page has finished loading
      if (document.readyState === "complete") {
        const lcp = lastEntry.startTime;
        this.sendToApi({
          metric_type: "web_vital",
          metric_name: "LCP",
          metric_value: lcp,
          metric_unit: "ms",
        });
        lcpObserver.disconnect();
      }
    });

    // Start observing largest-contentful-paint entries
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  }

  private trackFID() {
    if (!PerformanceObserver) return;

    // Create an observer for First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        // Use type assertion to fix TypeScript error
        const fidEntry = entry as PerformanceEntryWithStart;
        if (fidEntry.processingStart) {
          const fid = fidEntry.processingStart - fidEntry.startTime;
          this.sendToApi({
            metric_type: "web_vital",
            metric_name: "FID",
            metric_value: fid,
            metric_unit: "ms",
          });
        }
      });
    });

    // Start observing first-input entries
    fidObserver.observe({ type: "first-input", buffered: true });
  }

  private trackCLS() {
    if (!PerformanceObserver) return;

    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    // Create an observer for Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        // Type assertion for LayoutShift entries
        const layoutShiftEntry = entry as LayoutShiftEntry;
        // Only count layout shifts without recent user input
        if (
          layoutShiftEntry.hadRecentInput === false &&
          typeof layoutShiftEntry.value === "number"
        ) {
          clsValue += layoutShiftEntry.value;
          clsEntries.push(entry);
        }
      });
    });

    // Start observing layout-shift entries
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // Report the CLS value after the page is hidden or before unload
    const reportCLS = () => {
      if (clsEntries.length > 0) {
        this.sendToApi({
          metric_type: "web_vital",
          metric_name: "CLS",
          metric_value: clsValue,
          metric_unit: "",
        });
      }
    };

    ["visibilitychange", "beforeunload"].forEach((type) => {
      window.addEventListener(type, reportCLS, { once: true });
    });
  }

  private trackTTFB() {
    // Time to First Byte using the Navigation Timing API
    window.addEventListener("load", () => {
      if (performance && performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries.length > 0) {
          const navEntry = navEntries[0] as PerformanceNavigationTiming;
          const ttfb = navEntry.responseStart;
          this.sendToApi({
            metric_type: "web_vital",
            metric_name: "TTFB",
            metric_value: ttfb,
            metric_unit: "ms",
          });
        }
      }
    });
  }

  private trackFCP() {
    if (!PerformanceObserver) return;

    // Create an observer for First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fcp = entry.startTime;
        this.sendToApi({
          metric_type: "web_vital",
          metric_name: "FCP",
          metric_value: fcp,
          metric_unit: "ms",
        });
        fcpObserver.disconnect();
      });
    });

    // Start observing paint entries
    fcpObserver.observe({ type: "paint", buffered: true });
  }

  private trackNavigationTiming() {
    window.addEventListener("load", () => {
      if (performance && performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries.length > 0) {
          const navEntry = navEntries[0] as PerformanceNavigationTiming;
          this.sendToApi({
            metric_type: "navigation_timing",
            dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp_connection: navEntry.connectEnd - navEntry.connectStart,
            server_response: navEntry.responseEnd - navEntry.responseStart,
            dom_interactive: navEntry.domInteractive - navEntry.responseEnd,
            dom_complete: navEntry.domComplete - navEntry.domInteractive,
            page_load: navEntry.loadEventEnd - navEntry.loadEventStart,
            total_page_load: navEntry.loadEventEnd,
          });
        }
      }
    });
  }

  private sendToApi(data: Record<string, unknown>) {
    fetch("https://www.nanosights.dev/api/tags/insights", {
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
