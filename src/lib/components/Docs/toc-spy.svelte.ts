class TocSpy {
	active = $state<string | null>(null);
}

export const tocSpy = new TocSpy();

let currentSig: string | null = null;
let observer: IntersectionObserver | null = null;
let mounts = 0;

function teardown() {
	observer?.disconnect();
	observer = null;
	currentSig = null;
	tocSpy.active = null;
}

export function attachTocSpy(slugs: string[], root: ParentNode | null): () => void {
	mounts++;
	const sig = slugs.join('|');

	if (sig !== currentSig) {
		observer?.disconnect();
		observer = null;
		tocSpy.active = null;
		currentSig = sig;

		if (slugs.length > 0 && typeof IntersectionObserver !== 'undefined') {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							tocSpy.active = entry.target.id;
							return;
						}
					}
				},
				{ rootMargin: '-30% 0px -55% 0px', threshold: 0 }
			);

			const target: ParentNode = root ?? document;
			for (const slug of slugs) {
				const el = target.querySelector(`#${CSS.escape(slug)}`);
				if (el) observer.observe(el);
			}
		}
	}

	return () => {
		mounts--;
		if (mounts === 0) teardown();
	};
}
