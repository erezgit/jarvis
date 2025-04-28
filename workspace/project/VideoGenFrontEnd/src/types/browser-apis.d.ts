interface URLSearchParams {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  forEach(
    callbackfn: (value: string, key: string, parent: URLSearchParams) => void,
    thisArg?: unknown,
  ): void;
}

interface EventListenerOrEventListenerObject {
  handleEvent?(event: Event): void;
  (event: Event): void;
}

interface AddEventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}

interface EventListenerOptions {
  capture?: boolean;
}

interface BlobPropertyBag {
  type?: string;
  endings?: 'transparent' | 'native';
}

interface ArrayBuffer {
  readonly byteLength: number;
  slice(begin?: number, end?: number): ArrayBuffer;
}

interface ArrayBufferView {
  buffer: ArrayBuffer;
  byteLength: number;
  byteOffset: number;
}

type BufferSource = ArrayBuffer | ArrayBufferView;

type BlobPart = BufferSource | Blob | string;

interface Blob {
  readonly size: number;
  readonly type: string;
  slice(start?: number, end?: number, contentType?: string): Blob;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface AbortSignalEventMap {
  abort: Event;
}

interface AbortSignal {
  readonly aborted: boolean;
  onabort: ((this: AbortSignal, ev: Event) => void) | null;
  addEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
}

interface AbortController {
  readonly signal: AbortSignal;
  abort(): void;
}

declare global {
  interface Window {
    URL: typeof globalThis.URL;
    webkitURL: typeof globalThis.URL;
    AbortController: typeof globalThis.AbortController;
  }

  type Timeout = ReturnType<typeof setTimeout>;
}

export {};
