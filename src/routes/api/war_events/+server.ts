import { json } from '@sveltejs/kit';
import type { WarEvent } from '$lib/types';

async function getWarEvents() {
	let posts: WarEvent[] = [];

	const paths = import.meta.glob('/src/war_events/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata as Omit<WarEvent, 'slug'>;
			const post = { ...metadata, slug } satisfies WarEvent;
			// console.log(post);
			posts.push(post);
		}
	}

	posts = posts.sort(
		(first, second) => new Date(first.date).getTime() - new Date(second.date).getTime()
	);

	return posts;
}

export async function GET() {
	const posts = await getWarEvents();
	return json(posts);
}
