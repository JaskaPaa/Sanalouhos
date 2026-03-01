import { fail } from '@sveltejs/kit';
import { Game } from './game';
import type { PageServerLoad, Actions } from './$types';

export const load = (({ cookies }) => {
	const game = new Game(cookies.get('sverdle'));
	
	console.log("load from server");
	console.log(game);
	
	cookies.set('sverdle', game.toString(), { path: '/' });

	return {
		letters: game.letters,
		solution: game.solution,
		solution2: game.solution2,
		tips: game.tips,
		gameover: game.gameover,
		winner: game.winner,	
	};
}) satisfies PageServerLoad;

export const actions = {
	/**
	 * Modify game state in reaction to a keypress. If client-side JavaScript
	 * is available, this will happen in the browser instead of here
	 */
	update: async ({ request, cookies }) => {
		const game = new Game(cookies.get('sverdle'));

		console.log("update from server");	

		const data = await request.formData();
		const key = data.get('key');
		
		cookies.set('sverdle', game.toString(), { path: '/' });
	},

	/**
	 * Modify game state in reaction to a guessed word. This logic always runs on
	 * the server, so that people can't cheat by peeking at the JavaScript
	 */
	enter: async ({ request, cookies }) => {
		const game = new Game(cookies.get('sverdle'));

		console.log("enter connect server");

		const data = await request.formData();
		//const guess = data.getAll('guess') as string[];

		const con = data.get('connect') as string;
		const click = data.get('click') as string;
		const tip = data.get('tip') as string;
		const gameover = data.get('gameover') as string;

		console.log("---con:", con);
		console.log("---gameover:", gameover);

		if (con) {
			if (!game.check(con)) {
				console.log("no word like that!", con);
				return fail(400, { badGuess: true });
			}
		}
		
		if (click) {
			console.log("---click:", click);
			game.click(click);
		}
		
		if (tip) {
			console.log("---click:", tip);
			game.tip();
		}

		if (gameover === "true") {
			console.log("game:", gameover);
			game.gameover = true;
		}
		

		cookies.set('sverdle', game.toString(), { path: '/' });
	},
	remove: async ({ request, cookies }) => {

		const game = new Game(cookies.get('sverdle'));
		console.log("remove server");	

		const data = await request.formData();

		const rem = data.get('remove') as string;

		console.log("---con:", rem);

		cookies.set('sverdle', game.toString(), { path: '/' });
	},

	restart: async ({ cookies }) => {
		cookies.delete('sverdle', { path: '/' });
		const game = new Game(cookies.get('sverdle'));
		cookies.set('sverdle', game.toString(), { path: '/' });
	}
} satisfies Actions;
