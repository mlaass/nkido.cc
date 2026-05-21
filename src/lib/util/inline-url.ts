/**
 * Encode Akkado source into a live.nkido.cc inline-link URL.
 *
 * Format:  <origin>/p#code=<lz-base64url>
 *
 * Mirrors the encode side of nkido/web's `src/lib/ide/share/inline-url.ts`.
 * The live app's `/p` route decodes the same `#code=` hash back to source and
 * opens it in the full IDE — keep this format in sync with that route.
 */

import LZString from 'lz-string';

export function encodeInlineUrl(code: string, origin: string): string {
	const encoded = LZString.compressToEncodedURIComponent(code);
	return `${origin}/p#code=${encoded}`;
}
