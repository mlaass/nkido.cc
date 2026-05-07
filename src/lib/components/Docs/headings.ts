export type Heading = { slug: string; text: string; depth: number };

export type NestedHeading = Heading & { children: Heading[] };

type ManifestEntry = { url: string; headings?: Heading[] };
type ManifestLike = { entries: Record<string, ManifestEntry[]> };

export function resolveHeadings(pathname: string, manifest: ManifestLike): Heading[] {
	const path = pathname.replace(/\/$/, '') || '/';
	for (const list of Object.values(manifest.entries)) {
		for (const entry of list) {
			if (entry.url.replace(/\/$/, '') === path) {
				return entry.headings ?? [];
			}
		}
	}
	return [];
}

export function shouldRenderTOC(headings: Heading[]): boolean {
	let h2 = 0;
	for (const h of headings) if (h.depth === 2) h2++;
	return h2 >= 3;
}

export function nestHeadings(headings: Heading[]): NestedHeading[] {
	const out: NestedHeading[] = [];
	for (const h of headings) {
		if (h.depth === 2) {
			out.push({ ...h, children: [] });
		} else if (h.depth === 3 && out.length > 0) {
			out[out.length - 1].children.push(h);
		}
	}
	return out;
}

export function tocSlugs(headings: Heading[]): string[] {
	const out: string[] = [];
	for (const h of headings) {
		if (h.depth === 2 || h.depth === 3) out.push(h.slug);
	}
	return out;
}
