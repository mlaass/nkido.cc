import { browser } from '$app/environment';

export type ThemePref = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function readPref(): ThemePref {
	if (!browser) return 'system';
	const v = localStorage.getItem(STORAGE_KEY);
	return v === 'light' || v === 'dark' ? v : 'system';
}

function readOs(): ResolvedTheme {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

class ThemeState {
	preference: ThemePref = $state(readPref());
	osTheme: ResolvedTheme = $state(readOs());
	resolved: ResolvedTheme = $derived(
		this.preference === 'system' ? this.osTheme : this.preference
	);

	set(pref: ThemePref) {
		this.preference = pref;
		if (!browser) return;
		if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, pref);
	}

	cycle() {
		const next: ThemePref =
			this.preference === 'system' ? 'light' : this.preference === 'light' ? 'dark' : 'system';
		this.set(next);
	}
}

export const theme = new ThemeState();

if (browser) {
	const mql = window.matchMedia('(prefers-color-scheme: dark)');
	mql.addEventListener('change', () => {
		theme.osTheme = mql.matches ? 'dark' : 'light';
	});
}
