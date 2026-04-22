export type Post = {
	slug: string;
	title: string;
	date: string; // ISO YYYY-MM-DD
	author: string;
	excerpt: string;
};

export const posts: Post[] = [
	{
		slug: 'introducing-nkido',
		title: 'Introducing NKIDO',
		date: '2026-04-22',
		author: 'mlaass',
		excerpt:
			'A live-coded audio engine that runs in the browser, on desktop, in Godot, and on ESP32 — now open source under MIT.'
	}
];
