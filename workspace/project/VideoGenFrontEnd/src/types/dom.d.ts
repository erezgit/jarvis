interface EventListenerOrEventListenerObject {
  handleEvent?(event: Event): void;
  (event: Event): void;
}

interface Event {
  readonly type: string;
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  preventDefault(): void;
  stopPropagation(): void;
}

interface EventTarget {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  dispatchEvent(event: Event): boolean;
}

interface AbortSignal extends EventTarget {
  readonly aborted: boolean;
}

interface AbortController {
  readonly signal: AbortSignal;
  abort(): void;
}

interface Blob {
  size: number;
  type: string;
  slice(start?: number, end?: number, contentType?: string): Blob;
}

declare global {
  const URL: {
    createObjectURL(blob: Blob): string;
    revokeObjectURL(url: string): void;
  };

  const AbortController: {
    prototype: AbortController;
    new (): AbortController;
  };
}

export {};
