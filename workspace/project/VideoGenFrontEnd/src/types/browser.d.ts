/// <reference lib="dom" />

declare global {
  // Re-export DOM types from globalThis
  type URL = globalThis.URL;
  type URLSearchParams = globalThis.URLSearchParams;
  type AbortController = globalThis.AbortController;
  type AbortSignal = globalThis.AbortSignal;
  type Blob = globalThis.Blob;
  type BlobPart = globalThis.BlobPart;
  type BufferSource = globalThis.BufferSource;

  // Window interface extensions
  interface Window {
    URL: typeof globalThis.URL;
    webkitURL: typeof globalThis.URL;
    AbortController: {
      new (): AbortController;
      prototype: AbortController;
    };
  }

  // Utility types
  type Timeout = ReturnType<typeof setTimeout>;
}

export {};
