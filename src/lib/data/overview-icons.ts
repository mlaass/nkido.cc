/**
 * Single source of truth for which Lucide icon names the overview grid is
 * allowed to render. OverviewCard.svelte imports these to build its static
 * iconMap; scripts/build-overview.ts imports them to validate icon names
 * authored in upstream frontmatter.
 *
 * Adding a new icon is a 2-step change: extend this list, then author it
 * in upstream frontmatter on the next mirror pass. Until both steps land,
 * unknown icons fall back to Box at build time.
 */
export const OVERVIEW_ICON_NAMES = [
	'Activity',
	'AreaChart',
	'AudioWaveform',
	'BarChart',
	'Binary',
	'Box',
	'Brackets',
	'Calculator',
	'Clock',
	'Cylinder',
	'Database',
	'Drum',
	'FolderOpen',
	'Gauge',
	'GitBranch',
	'Grid3x3',
	'Headphones',
	'KeyRound',
	'Layers',
	'LineChart',
	'ListMusic',
	'Mic',
	'Music',
	'Music2',
	'Parentheses',
	'Piano',
	'Plug',
	'Radio',
	'Repeat2',
	'Sigma',
	'Sliders',
	'Triangle',
	'Variable',
	'Wand2',
	'Waves',
	'Wind',
	'Workflow',
	'Wrench',
	'Zap'
] as const;

export type OverviewIconName = (typeof OVERVIEW_ICON_NAMES)[number];

const ICON_SET: Set<string> = new Set(OVERVIEW_ICON_NAMES);

export function isKnownIcon(name: string): name is OverviewIconName {
	return ICON_SET.has(name);
}
