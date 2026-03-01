import { words3 } from './word3.server';


type Square = {
    dirs: number[][],
    letter: string,
    num: number,
    word_num: number,
};

let grid: Square[][] = [];

function gen_dirs(r: number, c: number, rmax: number, cmax: number) {
    let dirs = [];

    let rows = [-1, 0, 1];
    let cols = [-1, 0, 1];

    let r_i = r;
    let c_i = c;

    for (const i of rows) {
        for (const j of cols) {
            if (r_i + i >= 0 && r_i + i < rmax && c_i + j >= 0 && c_i + j < cmax) {
                dirs.push([r_i + i, c_i + j]);
            }
        }
    }

    return dirs;
}

function grid_init() {
    let rows = 6; 
    let cols = 5;

    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            let s = {dirs: gen_dirs(r, c, rows, cols), letter: "-", num: 0, word_num: 0};
            grid[r][c] = s; 
        }
    }
}

function grid_toString() {
    let str = "";

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            str += grid[r][c].letter;
        }
    }
    return str;
}

function random_start() {
    let r;
    let c;

    while (true) {
        r = Math.floor(Math.random() * 6);
        c = Math.floor(Math.random() * 5);

        if (grid[r][c].letter == "-") {
            break;
        }
    }
    return [r, c];
}

function make_move(pos: number[], letter: string) {
    
    let s = grid[pos[0]][pos[1]];

    for (let i = s.dirs.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [ s.dirs[i],  s.dirs[j]] = [ s.dirs[j],  s.dirs[i]]; 
    } 

    for (const dir of s.dirs) {
        let next = grid[dir[0]][dir[1]];
        if (next.letter == "-") {
            next.letter = letter;
            next.num = s.num + 1;
            next.word_num = s.word_num;
            return [dir[0], dir[1]]; 
        }
        
    }

    return [];

}

function solve(words: string[]) {

    for (let i = 0; i < words.length; i++) {
        let pos = random_start();
        let first_char = true;

        for (const c of words[i]) {
            if (first_char) {
                grid[pos[0]][pos[1]].letter = c;
                grid[pos[0]][pos[1]].word_num = i;
                first_char = false;
                continue;
            }

            let result = make_move(pos, c);
            //console.log("res:", result);     

            if (result.length === 0)
                return false;
            
            pos = result;
        }
    }

    return true;
}

function findByNumber(n: number) {
    let words: { pos: number, num: number } [] = [];

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].word_num === n)
                words.push({ pos: 5*r + c, num: grid[r][c].num });
        }
    }

    words.sort((a, b) => a.num - b.num);

    let numArr = [];
    for (const w of words) {
        numArr.push(w.pos);
    }

    //console.log("words:", words);
    //console.log("words:", numArr);

    return numArr;
}

function getSolution() {

    let sol: number[][] = [];

    let count = 0;

    while (true) {
        let res = findByNumber(count);
        
        if (res.length === 0)
            break;

        sol.push(res);
        count++; 
    }
    console.log("sol:", sol);

    return sol;    

}


function find_words() {
    let words = [];

    let len = 0;

    while (len !== 30) {
        let ind = Math.floor(Math.random() * words3.length);
        len += words3[ind].length;

        words.push(words3[ind]);
        
        if (len > 30) {
            words = [];
            len = 0;
        }
    }

    return words;
}

export function randomWord() {
    let ind = Math.floor(Math.random() * words3.length);

    grid_init();

    let words = "vanukas|sikala|kauppias|äänne|loma".split('|');

    //console.log(find_words());

    words = find_words();

    let count = 0;

    while (true) {
        grid_init();
        if (solve(words)) {
            console.log("Try #", count);
            break;
        }
        count++;
    }

    console.log(grid);
    console.log(words);
    //findByNumber(0);
    
    //getSolution();


    return {str: grid_toString(), sol: getSolution()};
}



   

