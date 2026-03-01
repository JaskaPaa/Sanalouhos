<script lang="ts">


function draw(canv: HTMLCanvasElement, sol: number[][], clicked: number) {
    const ctx = canvas2.getContext('2d');

    //canv.width = w;
    //canv.height = h;

    debug = "id canvas ok?";

    if (!ctx) return;

    debug = "canvas OK " + canv.height + " " + canv.width;

    if (sol.length > 0)
        debug = "sol: " + sol[0][0];
    
    ctx.lineWidth = 0;

    let words2 = sol;

    console.log("canvas", canv.width);
    console.log("canvas", canv.height);
    $inspect(words2);

    ctx.clearRect(0, 0, canv.width, canv.height);

    // must draw something, won't clear if not
    ctx.beginPath(); 
    ctx.rect(0, 0, 20, 50);
    ctx.fill();

    let s = w/5;
    let c = s/2;

    console.log("s", s);
    
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = c;
    ctx.lineCap = "round";

    console.log("clicks:", click1, click2);

    for (let j = 0; j < words2.length; j++) {
    
        ctx.strokeStyle = (j === clicked) ? "turquoise" : "#00FFFF";

        for (let k = 0; k < words2[j].length; k++) {
            let pos = words2[j][k];
            let col = pos%5;
            let row = Math.floor(pos/5);
            ctx.beginPath();
            ctx.arc(col*s + c, row*s + c, c/6, 0, 2 * Math.PI);
            ctx.fillStyle = "#00000000";
            ctx.fill();
            ctx.stroke();	
        }
    }

    ctx.lineWidth = 2*c/3;
    ctx.strokeStyle = "#00FFFF";

    for (let j = 0; j < words2.length; j++) {
        
        ctx.strokeStyle = (j === clicked) ? "turquoise" : "#00FFFF";

        for (let k = 0; k < words2[j].length; k++) {
            let pos = words2[j][k];
            let col = pos%5;
            let row = Math.floor(pos/5);
            ctx.beginPath();
            ctx.moveTo(col*s + c, row*s + c);
            if (k + 1 < words2[j].length) {
                let pos2 = words2[j][k+1];
                let col2 = pos2%5;
                let row2 = Math.floor(pos2/5);
                ctx.lineTo(col2*s + c, row2*s + c);
            }
            ctx.stroke();
        }
    } 
}
/*$effect(() => {
		const ctx = canvas.getContext('2d');
		canvas.width = w;
		canvas.height = h;

		if (!ctx) return;
		
		ctx.lineWidth = 0;

		let words2 = data.solution;

		if (data.winner) {
			setTimeout(() => {
				gameover = true;
    		}, 2000);
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// must draw something, won't clear if not
		ctx.beginPath(); 
		ctx.rect(0, 0, 0, 0);
		ctx.fill();
		
		let s = h/6;
		let c = s/2;
		
		ctx.strokeStyle = "#00FFFF";
		ctx.lineWidth = c;
		ctx.lineCap = "round";

		for (let j = 0; j < words2.length; j++) {
			for (let k = 0; k < words2[j].length; k++) {
				let pos = words2[j][k];
				let col = pos%5;
				let row = Math.floor(pos/5);
				ctx.beginPath();
				ctx.arc(col*s + c, row*s + c, c/6, 0, 2 * Math.PI);
				ctx.fillStyle = "#00000000";
				ctx.fill();
				ctx.stroke();
			}
		}

		ctx.lineWidth = c/2;

		for (let j = 0; j < words2.length; j++) {
			for (let k = 0; k < words2[j].length; k++) {
				let pos = words2[j][k];
				let col = pos%5;
				let row = Math.floor(pos/5);
				ctx.beginPath();
				ctx.moveTo(col*s + c, row*s + c);
				if (k + 1 < words2[j].length) {
					let pos2 = words2[j][k+1];
					let col2 = pos2%5;
					let row2 = Math.floor(pos2/5);
					ctx.lineTo(col2*s + c, row2*s + c);
				}
				ctx.stroke();
			}
		}		
	});*/
</script>