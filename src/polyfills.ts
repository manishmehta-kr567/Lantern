import { Buffer } from 'buffer';

declare global {
  interface Window {
    global: Window;
    Buffer: typeof Buffer;
  }
}

if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = Buffer;
}
