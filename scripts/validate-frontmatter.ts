#!/usr/bin/env bun
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
import matter from 'gray-matter';

type RuleSet = {
	required: string[];
	optional?: string[];
};

const rules: Record<string, RuleSet> = {
	doc: {
		required: ['title'],
		optional: ['description', 'category', 'order', 'keywords', 'backHref', 'backLabel', 'referenceKeyword']
	},
	blog: {
		required: ['title', 'date'],
		optional: ['description', 'author', 'category', 'excerpt', 'keywords']
	}
};

const glob = new Glob('src/routes/**/+page.md');
let failed = false;
let count = 0;

for await (const file of glob.scan('.')) {
	count++;
	const raw = readFileSync(file, 'utf8');
	const { data } = matter(raw);

	const layout: string = typeof data.layout === 'string' ? data.layout : 'doc';
	const rule = rules[layout];
	if (!rule) {
		console.error(`✗ ${file}: unknown layout "${layout}" (expected one of ${Object.keys(rules).join(', ')})`);
		failed = true;
		continue;
	}

	const missing = rule.required.filter((k) => data[k] === undefined || data[k] === null || data[k] === '');
	if (missing.length > 0) {
		console.error(`✗ ${file}: missing required frontmatter field(s): ${missing.join(', ')}`);
		failed = true;
	}
}

if (failed) {
	console.error(`\nFrontmatter validation failed (${count} files checked).`);
	process.exit(1);
}

console.log(`✓ frontmatter ok (${count} files)`);
