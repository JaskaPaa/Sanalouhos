import { words, allowed } from './words.server';
import { randomWord } from './generator';

import { words3 } from './word3.server';

//import * as crypto from 'crypto';
import AES from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';
//import Base64 from 'crypto-js/enc-base64';

const key = "2f3eddea7ad84b36af80a2b03cbd55a7"; //crypto.randomBytes(32);

export class Game {
	letters: string;	
	solution: number[][];
	solution2: number[][];
	tips: number[];
	encrypted: string;
	gameover: boolean;
	winner: boolean;
	
	/**
	 * Create a game object from the player's cookie, or initialise a new game
	 */
	constructor(serialized: string | undefined = undefined) {
		if (serialized) {
			console.log(serialized);
			const [letters, solution, solution2, tips, encrypted, gameover, winner] = serialized.split('--');

			this.letters = letters ? letters : "";

			this.solution  = solution  ? this.toArray(solution) : [];
			this.solution2 = []; //solution2 ? this.toArray(solution2) : [];

			let nums = tips.split('.');
			let arr = [];
			
			for (const num of nums) {
				if (num !== '') // from empty string +num => 0
					arr.push(+num);
			}

			this.tips = arr;
			this.encrypted = encrypted ? encrypted : "";
			this.gameover = (gameover === "true") ? true : false;
			this.winner = (winner === "true") ? true : false;

			if (this.winner)
				this.gameover = true;

			console.log("this.encrypted:", this.encrypted);
			console.log("decrypted:", AES.decrypt(this.encrypted, key).toString(UTF8));
			
			if (this.gameover) {
				console.log("gameover ---------------------------------");
				let sol = AES.decrypt(this.encrypted, key).toString(UTF8);
				this.solution2 = this.toArray(sol);
			}

		} else {
			let gen = randomWord();

			this.letters = gen.str;
			this.solution = [];
			this.solution2 = []; //gen.sol;
			this.tips = [];

			let sol = gen.sol.join('-');
			sol = sol.replaceAll(",", '.');

			this.encrypted = AES.encrypt(sol, key).toString();
			this.gameover = false;
			this.winner = false;
		}
	}

	/**
	 * Update game state based on a guess of a five-letter word. Returns
	 * true if the guess was valid, false otherwise
	 */
	enter(letters: string[]) {
		const word = letters.join('');
		const valid = allowed.has(word);

		if (!valid) return false;	
		
		return true;
	}

	/**
	 * Update game state based on a guess of a five-letter word. Returns
	 * true if the guess was valid, false otherwise
	 */
	check(letters: string) {

		let nums = JSON.parse(letters);
		
		let word = "";
		for (const n of nums) {			
			//console.log(this.letters[n]);
			word += this.letters[n];
		}

		console.log(word);
		
		const valid = words3.includes(word);

		if (valid) {
			this.solution.push(nums);
			
			let count = 0;
			for (let j = 0; j < this.solution.length; j++) {
				for (let k = 0; k < this.solution[j].length; k++) {
					count++;
				}

			}

			this.winner = (count >= 30) ? true : false;
		}

		return valid;
	}

	click(click: string) {
		let pos= +click;
		console.log(+click);
		for (let j = 0; j < this.solution.length; j++) {
			if (this.solution[j].includes(pos)) {
				this.solution.splice(j, 1);
				console.log("removed!");
			}	
		}
	}

	tip() {
		let len = this.tips.length;

		let str = AES.decrypt(this.encrypted, key).toString(UTF8);
		let solution = this.toArray(str);

		if (len === solution.length)
			return;

		this.tips.push(solution[len][0]);
	}

	/**
	 * Serialize game state so it can be set as a cookie
	 */
	toString() {
		let sol = this.solution.join('-');
		sol = sol.replaceAll(",", '.');
		
		let sol2 = this.solution2.join('-');
		sol2 = sol2.replaceAll(",", '.');

		let tips = this.tips.join();
		console.log("....tips:", tips);
		tips = tips.replaceAll(",", '.');

		console.log("....tips:", tips);

		return `${this.letters}--${sol}--${sol2}--${tips}--${this.encrypted}--${this.gameover}--${this.winner}`;
	}

	toArray(str: string) {
		let sol = str.split('-');
		let array = [];

		for (const word of sol) {
			let nums = word.split('.');
			let arr = [];
			for (const num of nums) {
				arr.push(+num);
			}
			array.push(arr);
		}
		console.log("array:", array);
		return array;
	}
}
