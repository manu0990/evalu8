const SEPARATOR = " ||| ";

/**
 * Round-robin API key rotator.
 *
 * Accepts a single env-var string containing one or more API keys
 * separated by ` ||| `, and hands out the next key on each call
 * to `next()`.
 *
 * Example env value:
 *   WEB_LLM_API_KEY="AIzaSy...key1 ||| AIzaSy...key2 ||| AIzaSy...key3"
 */
export class KeyRotator {
  private readonly keys: string[];
  private index = 0;

  constructor(envValue: string) {
    this.keys = envValue
      .split(SEPARATOR)
      .map((k) => k.trim())
      .filter(Boolean);

    if (this.keys.length === 0) {
      throw new Error("KeyRotator: no valid keys found after splitting.");
    }
  }

  /** Return the next key in round-robin order. */
  next(): string {
    const key = this.keys[this.index]!;
    this.index = (this.index + 1) % this.keys.length;
    return key;
  }

  /** Total number of available keys. */
  get count(): number {
    return this.keys.length;
  }
}
