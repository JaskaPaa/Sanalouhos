<script lang="ts">
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcomeFallback from '$lib/images/svelte-welcome.png';
	import Wordlist from '../lib/Wordlist.svelte';
	import close from '$lib/images/close.svg';
	import { fly } from 'svelte/transition';


	import { enhance } from '$app/forms';
	import { confetti } from '@neoconfetti/svelte';
	import type { ActionData, PageData } from './$types';
	import { reducedMotion } from './reduced-motion';
	
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import Modal from './Modal.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form = $bindable() }: Props = $props();

	console.log(data);

	/** Whether or not the user has won */
	let won = false;

	let winner = $state(false);
	let gameover = $state(false);
	let clicked: Array<number> =  $state([]);
	let copy_clicked: Array<number> =  $state([]);
	let bad = $state(form?.badGuess);
	let showModal = $state(false);
	let tips: Array<number> =  $state([]);

	

	$effect(() => {
		if (gameover)
			showModal = true;
	});
	
	function handleClick(r: number, c: number) {

		if (data.gameover)
			return;

		let last = clicked[clicked.length - 1];

		let pos = 5*r + c;
		
		if (last === (5*r + c)) {
			clicked.pop();
			return;
		}

		if (clicked.includes(5*r + c))
			return;

		for (let j = 0; j < data.solution.length; j++) {
			if (data.solution[j].includes(pos)) {
				return;
			}	
		}	

		let lastCol = last%5;
		let lastRow = Math.floor(last/5);

		if (last !== undefined) {		
			if (!(r === lastRow - 1 || r === lastRow + 1 || r === lastRow))
				return;
			if (!(c === lastCol - 1 || c === lastCol + 1 || c === lastCol))
				return;
		}

		clicked.push(5*r + c);
	}

	function connect(event: MouseEvent) {
		
		copy_clicked = clicked;

		clicked = [];
		
		let count = 0;
		for (let j = 0; j < data.solution.length; j++) {
			for (let k = 0; k < data.solution[j].length; k++) {
				count++;
			}
		}
		
		if (form) // to get wiggle animation always on a bad guess
			form.badGuess = false;

		winner = (count === 30) ? true : false;

	}

	function showSolution() {
		if (form) // no wiggle animation
			form.badGuess = false;
		gameover = true;
		showModal = true;
	}

	const confirmShowSolution = () => {
		dialog.close();

		if (form) // no wiggle animation
			form.badGuess = false;
		gameover = true;
		showModal = true;
		quit2.click();
		
	};

	function showTips() {
		if (tips.length === data.solution2.length)
			return;

		let i = tips.length;
		tips.push(data.solution2[i][0]);
	}

	function restart(event: MouseEvent) {
		data.solution = [];	
	}
	
	function inWords(pos: number) {

		let sol = data.solution;

		for (let j = 0; j < sol.length; j++) {
			if (sol[j].includes(pos))
				return true;	
		}	

		return false;
	}

	function toString(word: number[]) {
		let str = "";

		for (const n of word) {
			str += data.letters[n];
		} 
		return str;
	}


	let h: number = $state(0);
	let w: number = $state(0);

	$inspect("h::", h);
	$inspect("w::", w);


	$inspect("showModal:", showModal);

	let reload: HTMLButtonElement;
	let quit: HTMLButtonElement;
	let quit2: HTMLButtonElement;

	let dialog: HTMLDialogElement;

	let str = data.gameover ? "peli ohi" : '|';

	//  vigvami EI taida olla sana !!!!

	function toPolyline(word: number[]) {
		let str = "";

		let s = w/5;
		let c = s/2;

		for (const n of word) {
			let col = n%5;
			let row = Math.floor(n/5);
			
			str += (col*s + c).toString() + "," + (row*s + c).toString() + " ";
		} 
		return str;
	}


</script>


<svelte:head>
	<title>Sanalouhos</title>
	<meta name="description" content="A Sanalouhos clone written in SvelteKit" />
</svelte:head>

<h1 class="visually-hidden">Sverdle</h1>

<form
	method="post"
	id="gridform"
	action="?/enter"
	use:enhance={() => {
		// prevent default callback from resetting the form
		return ({ update }) => {
			update({ reset: false });
		};
	}}
></form>

<div class="buttons line">	
	<span class:blinking-text={ clicked.length === 0 }>{(clicked.length !== 0) ? toString(clicked) : str}</span>
</div>
<div class="buttons words">
	{#if false}
		{#each data.solution2 as item}
			<button class="word" type="submit" form="gridform" data-key="click"
			name="click"
			value={item[0]}>{toString(item)}   <img class="bigger" src={close} alt="Close"></button>
		{/each}
	{:else}
		{#each data.solution as item}
			<button class="word" type="submit" form="gridform" data-key="click"
			name="click"
			value={item[0]}>{toString(item)}   <img class="bigger" src={close} alt="Close"></button>
		{/each}
	{/if}
</div>

<div style="position:relative;" bind:clientWidth={w} bind:clientHeight={h} 
	class="grid" class:playing={!won} class:bad-guess={form?.badGuess}>
	{#each Array.from(Array(6).keys()) as row (row)}
		{@const current = true}
		<h2 class="visually-hidden">Row {row + 1}</h2>
		<div class="row" class:current>
			{#each Array.from(Array(5).keys()) as column (column)}
				{@const value = data.letters[row*5 + column]}
				{@const selected = clicked.includes(5*row + column)}
				{@const last = clicked[clicked.length-1] === (5*row + column)}
				{@const inwords = inWords(5*row + column)}
				{@const hint = data.tips.includes(5*row + column)}
				{@const lastTip = data.tips[data.tips.length-1] === (5*row + column)}
				<button onclick={() => handleClick(row, column)}
					class="letter" class:selected class:last class:inwords class:hint
					class:lastTip
					type="submit" form={ inwords ? "gridform" : "" }
					data-key="click"
					name="click"
					value={5*row + column}
					>
					{value}
					<input name="guess" disabled={false} type="hidden" {value} />
				</button>
			{/each}
		</div>
	{/each}
	
	<svg version="1.1" width={w} height={h}
		xmlns="http://www.w3.org/2000/svg" style="position:absolute; z-index:-1" >
		{#each data.solution as item, i}
			{#each item as pos}
				<circle cx={(pos%5) * w/5 + w/10} cy={Math.floor(pos/5) * w/5 + w/10} r={w/15} fill="aqua" />
			{/each}				
		{/each}
		{#each data.solution as word, i}
			<polyline points={toPolyline(word)} fill="none" stroke="aqua" stroke-width={w/20}
			stroke-linejoin="round" stroke-linecap="round" />
		{/each}
	</svg>
</div>

<form method="post"
	use:enhance={() => {
		// prevent default callback from resetting the form
		return ({ update }) => {
			update({ reset: false });
		};
	}}>
	<button class="visually-hidden" bind:this={quit2} onclick={restart}
		data-key="gameover"
		formaction="?/enter"
		name="gameover"
		value="true"		
	> loppu </button>
</form>
	
<div class="buttons" >
	<button  bind:this={quit} onclick={ () => dialog.show() } class="lite"
		type="submit" form="gridform"
		data-key="connect"
		formaction="?/enter"
		name="gameover22"
		value="true"		
		> Lopeta </button>
	<button onclick={showTips} class="tip"
		type="submit" form="gridform"
		data-key="tip"
		formaction="?/enter"
		name="tip"
		value="more"		
		> ? </button>	
	<button onclick={connect} class="right"
		type="submit" form="gridform"
		data-key="connect"
		formaction="?/enter"
		name="connect"
		value={JSON.stringify(copy_clicked)}		
		> Yhdistä </button>
</div>

<div><br></div>

<form method="post">
	<button class={!data.gameover ? "visually-hidden": ""} bind:this={reload} onclick={restart}
		data-key="restart"
		formaction="?/restart"
		name="restart"		
	> Uusi peli </button>
</form>

<dialog bind:this={dialog} id="confirmation-dialog">
	<button onclick={() => dialog.close()}>X</button>
    <h2><b> Haluatko lopettaa pelin? </b></h2>
    <p>Pelin lopetus paljastaa oikeat vastaukset, etkä voi enää yhdistää sanoja.</p>
    <button onclick={() => dialog.close()}>Jatka</button>
    <button onclick={confirmShowSolution}>Näytä ratkaisu</button>
</dialog>

{#if (data.winner)}
	<div
		style="position: absolute; left: 50%; top: 30%"
		use:confetti={{
			particleCount: $reducedMotion ? 0 : undefined,
			force: 0.7,
			stageWidth: window.innerWidth,
			stageHeight: window.innerHeight,
			colors: ['#ff3e00', '#40b3ff', '#676778']
		}}
	></div>
{/if}

<Modal bind:showModal bind:data cbClose={() => reload.click()}>
</Modal>

<style>
	form {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex: 0;
	}
	
	/*.how-to-play {
		color: var(--color-text);
	}

	.how-to-play::before {
		content: 'i';
		display: inline-block;
		font-size: 0.8em;
		font-weight: 900;
		width: 1em;
		height: 1em;
		padding: 0.2em;
		line-height: 1;
		border: 1.5px solid var(--color-text);
		border-radius: 50%;
		text-align: center;
		margin: 0 0.5em 0 0;
		position: relative;
		top: -0.05em;
	}*/

	.grid {
		--width: min(100vw, 40vh, 380px);
		max-width: var(--width);
		align-self: center;
		justify-self: center;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.grid .row {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 0.0rem;
		margin: 0 0 0 0;
	}


	.buttons {
		--width: min(100vw, 40vh, 380px);
		max-width: var(--width);
		align-self: center;
		justify-self: center;
		width: 100%;
		height: 100%;
		justify-content: space-between; /*flex-start;*/
		display: flex;
  		align-items: center;
  		flex-direction: row;
		/*--height: min(100vw, 40vh, 380px);
		min-height: 4rem;*/
	}

	.buttons.words {
		min-height: 4rem;
		display: flow;
		/*white-space: nowrap;*/
		/*overflow: scroll;*/
		line-height: 1rem;

	}
	
	.buttons.line {
		border-bottom: 0.1rem solid;
		text-transform: uppercase;
		text-align: center;
		justify-content: center;
		font-size: calc(0.08 * var(--width));
	}

	.bigger {
		height: calc(0.05 * var(--width));
		vertical-align: text-top;
		display: inline-block;
	}

	button {
        background-color: aqua;
		border-width: 0.2rem;
		border-color: rgb(117, 113, 173);
		border-radius: 1.5rem;
		padding: 0.5rem;
		font-size: calc(0.04 * var(--width));
    }

	button.right {
        float: right;
    }

	button.lite {
		background-color: rgb(226, 243, 243);
    }

	button.tip {
		--size: min(10vw, 2.5rem);
		width: var(--size);
		height: var(--size);
		margin: auto;
		border-radius: var(--size);
		background-color: rgb(204, 204, 216);
		font-size: calc(var(--size)*0.5);
		padding: 0;
    }

	button.word {
		text-transform: capitalize;
		padding: 0 0.5rem;
		border-width: 0.1rem;
		font-size: calc(0.04 * var(--width));
		margin: 0.2rem;
		max-height: 2rem;
		/*display: inline-block;*/
		padding: 0 0.1rem 0 0.3rem;
	}

	@media (prefers-reduced-motion: no-preference) {
		.grid.bad-guess .row.current {
			animation: wiggle 0.5s;
		}
	}

	.grid.playing .row.current {
		filter: drop-shadow(3px 3px 10px var(--color-bg-0));
	}

	.letter {
		aspect-ratio: 1;
		width: 100%;
		height: 100%;
		scale: 0.8;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		box-sizing: border-box;
		text-transform: uppercase;
		border: none;
		font-size: calc(0.08 * var(--width));
		border-radius: 20%;
		background: white;
		margin: 0;
		color: rgba(0, 0, 0, 0.9);
		filter: drop-shadow(3px 3px 5px var(--color-bg-0));
	}

	.letter.inwords {
		background: transparent;
		color: rgba(0, 0, 0, 0.4);
	}

	.letter.selected {
		background: var(--color-theme-2);
		color: white;
	}

	.letter.last {
		border: 4px solid blue;
	}

	.letter.hint {
		--border: min(1vw, 10px);
		border: dashed green;
		border-width: calc(0.01 * var(--width));
	}

	dialog {
		--size: min(95vw, 400px);
		--shadow: calc(0.05 * var(--size));
        max-width: var(--size);
		border-radius: 0.5rem;
		border: 0rem solid gray;
		padding: 2%;
		position: absolute; 
		top: 30%; 
		transform: translateY(-30%);
		filter: drop-shadow(0 0 var(--shadow) gray);
	}

	/*.selected {
		outline: 2px solid var(--color-theme-1);
	}*/
	@keyframes blink {
		0% {
			opacity: 1;
		}

		50% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	.blinking-text {
		text-align: center;
		margin-top: 0;
		font-size: calc(0.08 * var(--width));
		color: green;
		animation: blink 2s infinite;
	}

	.lastTip {
		text-align: center;
		margin-top: 0;
		font-size: calc(0.08 * var(--width));
		color: green;
		animation: blink 0.5s 2;
	}


	@keyframes wiggle {
		0% {
			transform: translateX(0);
		}
		10% {
			transform: translateX(-2px);
		}
		30% {
			transform: translateX(4px);
		}
		50% {
			transform: translateX(-6px);
		}
		70% {
			transform: translateX(+4px);
		}
		90% {
			transform: translateX(-2px);
		}
		100% {
			transform: translateX(0);
		}
	}
</style>