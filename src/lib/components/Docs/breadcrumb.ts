export type BreadcrumbSegment = {
	label: string;
	href: string;
	current: boolean;
};

type ManifestEntry = { title: string; slug: string; url: string };
type ManifestLike = { entries: Record<string, ManifestEntry[]> };

const TOP_LABELS: Record<string, string> = {
	builtins: 'Builtins',
	language: 'Language',
	'mini-notation': 'Mini-notation'
};

function findTitle(
	manifest: ManifestLike,
	bucket: string,
	slug: string,
	fullPath: string
): string {
	const entries = manifest.entries[bucket] ?? [];
	const found = entries.find((e) => e.slug === slug || e.url === fullPath);
	return found?.title ?? slug;
}

export function computeBreadcrumb(
	pathname: string,
	manifest: ManifestLike
): BreadcrumbSegment[] {
	const path = pathname.replace(/\/$/, '');
	const out: BreadcrumbSegment[] = [{ label: 'Docs', href: '/docs', current: false }];

	if (path === '/docs' || path === '') {
		out[0].current = true;
		return out;
	}

	if (path.startsWith('/docs/concepts')) {
		const isHub = path === '/docs/concepts';
		out.push({ label: 'Concepts', href: '/docs/concepts', current: isHub });
		if (!isHub) {
			const slug = path.split('/').pop()!;
			out.push({
				label: findTitle(manifest, 'concepts', slug, path),
				href: path,
				current: true
			});
		}
		return out;
	}

	if (path.startsWith('/docs/tutorials')) {
		const isHub = path === '/docs/tutorials';
		out.push({ label: 'Tutorials', href: '/docs/tutorials', current: isHub });
		if (!isHub) {
			const slug = path.split('/').pop()!;
			out.push({
				label: findTitle(manifest, 'tutorials', slug, path),
				href: path,
				current: true
			});
		}
		return out;
	}

	if (path.startsWith('/docs/reference')) {
		const parts = path.split('/'); // ['', 'docs', 'reference', 'builtins', 'filters']
		const top = parts[3];
		const leaf = parts[4];

		if (!top) {
			// /docs/reference
			out.push({ label: 'Reference', href: '/docs/reference', current: true });
			return out;
		}

		out.push({ label: 'Reference', href: '/docs/reference', current: false });
		const topLabel = TOP_LABELS[top] ?? top.charAt(0).toUpperCase() + top.slice(1);
		const topHref = `/docs/reference/${top}`;

		if (!leaf) {
			out.push({ label: topLabel, href: topHref, current: true });
			return out;
		}

		out.push({ label: topLabel, href: topHref, current: false });
		out.push({
			label: findTitle(manifest, `reference/${top}`, leaf, path),
			href: path,
			current: true
		});
		return out;
	}

	return out;
}
