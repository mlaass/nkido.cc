export interface LandingExample {
	slug: string;
	label: string;
	description: string;
}

export const LANDING_EXAMPLES: LandingExample[] = [
	{
		slug: 'dnb-amen',
		label: 'Drum & Bass',
		description: 'A fast-paced drum & bass track. Or do we need Jungle?'
	},
	{
		slug: 'fm-piano',
		label: 'FM Synth',
		description: 'Rhodes-style electric piano via two-operator FM synthesis with chord progression.'
	},
	{
		slug: 'wavetable-scan',
		label: 'Wavetable',
		description: 'Wavetable oscillator scanning through a bank of harmonic frames.'
	},
	{
		slug: 'microtonal-raga',
		label: 'Microtonal',
		description: 'A whale like melody line in 31-EDO tuning, with intervals between the semitones.'
	},
	{
		slug: 'poly-chords',
		label: 'Polyphony',
		description: 'Jazz progression with rich voicings allocated through poly() and a detuned saw pad.'
	},
	{
		slug: 'drum-machine',
		label: 'Drums',
		description: 'Layered drum kit with nested mini-notation, plus a Euclidean sub-bass tresillo.'
	},
	{
		slug: 'effects-chain',
		label: 'Effects',
		description: 'A pluck through saturation, lowpass, delay, chorus, reverb, and compressor.'
	},
	{
		slug: 'interactive-params',
		label: 'Interactive',
		description: 'Live UI sliders via param() driving a Moog-filtered saw stack.'
	},
	{
		slug: 'visualizations',
		label: 'Visualizations',
		description: 'Inline oscilloscope, spectrum, and pianoroll views on a single arpeggio.'
	},
	{
		slug: 'soundfont-play',
		label: 'SoundFont',
		description: 'Melody played through the built-in General MIDI SoundFont (acoustic piano).'
	},
];

export const DEFAULT_SLUG = 'fm-piano';

export function findExample(slug: string): LandingExample | undefined {
	return LANDING_EXAMPLES.find((e) => e.slug === slug);
}
