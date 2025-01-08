import { json } from '@sveltejs/kit';
import type { WebAppManifest } from 'web-app-manifest';
import type { RequestHandler } from './$types';
import { base } from '$app/paths';

export const prerender = true;

const baseOrRoot = base ? base : '/';

const manifest: WebAppManifest = {
	theme_color: '#020817', // hsl(222, 84%, 5%)
	background_color: '#f3f4f6', // rgb(243, 244, 246)
	display: 'standalone',
	scope: `${baseOrRoot}`,
	start_url: `${baseOrRoot}`,
	id: '/derivault/',
	name: 'DeriVault Password Manager',
	short_name: 'DeriVault',
	description: 'Secure, deterministic password manager that runs entirely in your browser',
	orientation: 'portrait',
	categories: ['utilities', 'security'],
	shortcuts: [],
	icons: [
		{
			src: `${baseOrRoot}${base ? '/' : ''}icon-512.png`,
			sizes: '512x512',
			type: 'image/png'
		}
	]
};

export const GET: RequestHandler = async () => {
	return json(manifest);
};
