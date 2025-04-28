/**
 * Core types for the prompt selection service
 */
export class PromptError extends Error {
    constructor(message, code, details) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: details
        });
        this.name = 'PromptError';
    }
}
