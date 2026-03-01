<script lang="ts">
    import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let { showModal = $bindable(), data = $bindable(), cbClose = () => {} } = $props();

	let dialog = $state() as HTMLDialogElement;

    let h: number = $state(10);
	let w: number = $state(10);

	let click1: number = $state(0);
	let click2: number = $state(0);

    // Split the letters into chunks
    let chunks: string[] = []; 

    for (let i = 0; i < 6; i++) {
        chunks.push(data.letters.substring(i*5, i*5 + 5));
    }
 
	$effect(() => {
		if (showModal) {
			if (dialog)
				dialog.showModal();
		}
	});

	function toString(word: number[]) {
		let str = "";

		for (const n of word) {
			str += data.letters[n];
		} 
		return str;
	}

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

	const count = (sol: number[][]) => {
		let count = 0;
		for (let j = 0; j < sol.length; j++) {
			for (let k = 0; k < sol[j].length; k++) {
				count++;
			}
		}
		return count;
	}

</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog	bind:this={dialog}>
	
	<div class="side-by-side onegrid">Tuloksesi: {count(data.solution)}/30</div>
	<div class="side-by-side">
		<div><p>Sinä:</p>
		{#each data.solution as item, i}
			{@const selected = click1 === i}
			<button class="word" class:selected onclick={() => click1 = i}>{toString(item)}</button>
		{/each}
		</div>
		<div><p>Ratkaisu:</p>
		{#each data.solution2 as item, i}
			{@const selected = click2 === i}
			<button class="word" class:selected onclick={() => click2 = i}>{toString(item)}</button>
		{/each}		
		</div>
	</div>
    <div class="side-by-side">
		{#snippet letters()}
			{#each chunks as rows, i}
				<div class="row">
				{#each rows as letter, i}
					<div class="letter">{letter}</div>
				{/each}
				</div> 
			{/each}
		{/snippet}	
		
		{#snippet wordlines(solution: number[][], click: number)}
			<svg version="1.1" width={w} height={h}
				xmlns="http://www.w3.org/2000/svg" style="position:absolute; z-index:-1" >
				{#each solution as item, i}
					{#each item as pos}
						<circle cx={(pos%5) * w/5 + w/10} cy={Math.floor(pos/5) * w/5 + w/10} r={w/15} fill={i === click? "turquoise" : "aqua"} />
					{/each}				
				{/each}
				{#each solution as word, i}
					<polyline points={toPolyline(word)} fill="none" stroke={i === click ? "turquoise" : "aqua"}
					stroke-width={w/20} stroke-linejoin="round" />
				{/each}
			</svg>
		{/snippet}

        <div class="grid" style="position:relative;"
            bind:clientWidth={w} bind:clientHeight={h}>
			{@render letters()}
			{@render wordlines(data.solution, click1)}
        </div>

        <div class="grid" style="position:relative;"
        	bind:clientWidth={w} bind:clientHeight={h}>
			{@render letters()}
			{@render wordlines(data.solution2, click2)}
        </div>
    </div>
	<div class="side-by-side">
		<div>
			Linkit:
			{#each data.solution as item}
				<a href="https://www.kielitoimistonsanakirja.fi/#/{toString(item)}"
				target="_blank">{toString(item)}</a> &nbsp;
			{/each}
		</div>
		<div>
			Linkit:
			{#each data.solution2 as item}
				<a href="https://www.kielitoimistonsanakirja.fi/#/{toString(item)}"
				target="_blank">{toString(item)}</a> &nbsp;
			{/each}
		</div>
	</div>
	
	<!-- svelte-ignore a11y_autofocus -->
	<button class="close" autofocus onclick={() => {showModal = false; cbClose(); dialog.close()} }
		>Uusi peli</button>
	
</dialog>

<style>
	dialog {
        width: 100%;
		height: 100%;
        min-height: 100%;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
    dialog:modal {
        max-width: 100vw;
    }

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: rota 0.5s;  /*cubic-bezier(0.34, 1.56, 0.64, 1);*/
	}
	@keyframes zoom {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}
	@keyframes rota {
		from {
			transform: translate(0px, 1000px);
		}
		to {
			transform: translate(0px, 0px);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	a {
		color: blue;
	}

	button {
		--width: min(50vw, 40vh, 250px);
        background-color: aqua;
		border-width: 0.2rem;
		border-color: rgb(117, 113, 173);
		border-radius: 1.5rem;
		padding: 0.5rem;
		font-size: calc(0.08 * var(--width));
    }

	button.close {
		display: block;
		margin: auto;
    }

	button.word {
		text-transform: capitalize;
		padding: 0 0.5rem;
		border-width: 0.0rem;
		font-size: calc(0.06 * var(--width));
		margin: 0.2rem;
		max-height: 2rem;
		/*display: inline-block;*/
		padding: 0 0.3rem 0 0.3rem;
	}

	.selected {
		background: turquoise;
		/*color: rgb(240, 232, 232);*/
	}

    .side-by-side {
        --width2: min(100vw, 80vh, 500px);        
		max-width: var(--width2);
        /*--height: min(100vw, 40vh, 380px);        
		max-height: var(--height);*/
		/*max-height: calc(1.25 * var(--width));*/
        box-sizing: border-box;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 0%;
        padding: 0;
        /*width: 50%;
		height: 50%;*/
		margin: auto;
    }

	.side-by-side.onegrid {
		grid-template-columns: 1fr;
	}

    .grid {
        /*aspect-ratio: 5/6;*/
		--width: min(50vw, 40vh, 250px);
		max-width: var(--width);
		max-height: calc(1.25 * var(--width));       
		align-self: center;
		justify-self: center;
		width: 100%;
        height: auto;
		/*height: 100%;*/
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
    

	.letter {
		--foo: min(50vw, 40vh, 250px);
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
		font-size: calc(0.08 * var(--foo));
		border-radius: 2px;
		background: transparent; /*rgb(153, 121, 121);*/
		margin: 0;
		color: rgba(0, 0, 0, 0.7);
	}

</style>
