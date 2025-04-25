/// <reference types="node" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference types="vite/client" />

// Declare any missing types
interface Window {
  IntersectionObserver: typeof globalThis.IntersectionObserver;
  ResizeObserver: typeof globalThis.ResizeObserver;
  errorTracker?: ErrorTracker;
  metrics?: Metrics;
}

// Ensure these types are available globally
declare global {
  type URL = globalThis.URL;
  type URLSearchParams = globalThis.URLSearchParams;
  type AbortController = globalThis.AbortController;
  type AbortSignal = globalThis.AbortSignal;
  type Element = globalThis.Element;
  type HTMLElement = globalThis.HTMLElement;
  type SVGElement = globalThis.SVGElement;
  type SVGSVGElement = globalThis.SVGSVGElement;
  type IntersectionObserver = globalThis.IntersectionObserver;
  type IntersectionObserverEntry = globalThis.IntersectionObserverEntry;
  type IntersectionObserverInit = globalThis.IntersectionObserverInit;
  type ResizeObserver = globalThis.ResizeObserver;
  type ResizeObserverEntry = globalThis.ResizeObserverEntry;
  type ResizeObserverCallback = globalThis.ResizeObserverCallback;
  type DOMRectReadOnly = globalThis.DOMRectReadOnly;
}

// This export is needed to make this a module
export {};

/**
 * Error tracker interface
 */
interface ErrorTracker {
  /**
   * Capture an exception
   * @param error The error to capture
   * @param options Options for the error
   */
  captureException(
    error: unknown, 
    options?: { 
      tags?: Record<string, string>; 
      extra?: Record<string, unknown> 
    }
  ): void;
}

/**
 * Metrics interface
 */
interface Metrics {
  /**
   * Increment a counter
   * @param name The name of the counter
   * @param tags Tags to associate with the counter
   */
  increment(name: string, tags?: Record<string, string>): void;
  
  /**
   * Set a gauge value
   * @param name The name of the gauge
   * @param value The value to set
   * @param tags Tags to associate with the gauge
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  
  /**
   * Record a timing
   * @param name The name of the timing
   * @param value The timing value in milliseconds
   * @param tags Tags to associate with the timing
   */
  timing(name: string, value: number, tags?: Record<string, string>): void;
}
