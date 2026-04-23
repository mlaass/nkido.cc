import { error } from '@sveltejs/kit';
import releasesData from '$lib/data/releases.json';
import type { EntryGenerator, PageLoad } from './$types';

type Release = {
	tag: string;
	title: string;
	body: string;
	date: string;
	prerelease: boolean;
	url: string;
};

type ReleasesFile = {
	generatedAt: string;
	releases: Release[];
};

const data = releasesData as ReleasesFile;

export const prerender = true;

export const entries: EntryGenerator = () => data.releases.map((r) => ({ tag: r.tag }));

export const load: PageLoad = ({ params }) => {
	const release = data.releases.find((r) => r.tag === params.tag);
	if (!release) {
		throw error(404, `Release ${params.tag} not found`);
	}
	return { release };
};
