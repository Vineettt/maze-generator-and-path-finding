let w_h = 600;
let cols = 25;
let rows = 25;
let currentI = 0;
let currentJ = 0;

let grid = new Array(cols);
let w, h;

let stack = [];
let queue = [];
let openSet = [];
let closedSet = [];

let start;
let end;

let started = false;

let maze_generator, path_finding;

let start_time, end_time;

let count = 0;
let indexI = 0;

let bias = document.querySelector('select[name="bias"]').value;

let mazeGeneratorAndPathFindingObject = {
    createCanvasFlag: true,
    createMaze: false,
    mazeCompleted: false,
    startPathFinding: false,
    slider: false
}

let history = [];

uiUpdate();

function downloadCanvas(){
    let canvasArray = document.getElementsByTagName("canvas");
    for (let index = 0; index < canvasArray.length; index++) {
        var link = document.createElement('a');
        link.download = `${new Date().getTime()}.png`;
        link.href = canvasArray[index].toDataURL()
        link.click();
    }
}

function uiUpdate() {
    let temp = parseInt(document.getElementById("no_of_cells").value);
    cols = temp;
    rows = temp;
    w_h = parseInt(document.getElementById("weight_height").value);
    bias = document.querySelector('select[name="bias"]').value;
    maze_generator = document.querySelector('input[name="maze_generator"]:checked').value;
    document.getElementById("startIndexI").max = cols - 1;
    document.getElementById("startIndexJ").max = rows - 1;
    document.getElementById("endIndexI").max = cols - 1;
    document.getElementById("endIndexJ").max = rows - 1;
    document.getElementById("startIndexI").value = 0;
    document.getElementById("startIndexJ").value = 0;
    document.getElementById("endIndexI").value = cols - 1;
    document.getElementById("endIndexJ").value = rows - 1;
    this.updateCurrentIndexes();
}

function updateStartAndEndCordindates() {
    mazeGeneratorAndPathFindingObject.slider = true;
    mazeGeneratorAndPathFindingObject.mazeCompleted = false;
    mazeGeneratorAndPathFindingObject.startPathFinding = false;
    openSet = [];
    closedSet = [];
    queue = [];
    stack = [];
    loop();
}

function updateCurrentIndexes() {
    bias = document.querySelector('select[name="bias"]').value;
    if (bias === "nw") {
        currentI = 0;
        currentJ = 0;
    }
    if (bias === "ne") {
        currentI = 0;
        currentJ = rows - 1;
    }
    if (bias === "sw") {
        currentI = rows - 1;
        currentJ = 0;
    }
    if (bias === "se") {
        currentI = cols - 1;
        currentJ = rows - 1;
    }
}

function updateCanvasData() {
    this.uiUpdate();
    stack = [];
    openSet = [];
    closedSet = [];
    queue = [];
    grid = new Array(cols);
    this.setup();
    mazeGeneratorAndPathFindingObject.createCanvasFlag = true;
    loop();
}

function initMazeGeneration() {
    updateStatus('Generating maze...');
    this.updateCanvasData();
    mazeGeneratorAndPathFindingObject.createCanvasFlag = true;
    mazeGeneratorAndPathFindingObject.createMaze = true;
    mazeGeneratorAndPathFindingObject.startPathFinding = false;
    mazeGeneratorAndPathFindingObject.mazeCompleted = false;
    count = 0;
    if (maze_generator === "binary_tree") {
        if (bias === "se" || bias === "ne") {
            indexI = 0;
        } else if (bias === "nw" || bias === "sw") {
            indexI = cols - 1;
        }
    }
    start_time = new Date();
    let tempObj = {};
    tempObj[maze_generator] = 0;
    history.push({ maze : tempObj});
    loop();
}

function initPathFinding() {
    updateStatus('Finding path...');
    path_finding = document.querySelector('input[name="path_finding"]:checked').value;
    mazeGeneratorAndPathFindingObject.startPathFinding = true;
    openSet = [];
    closedSet = [];
    queue = [];
    openSet.push(start);
    queue.push(start);
    count = 0;
    start_time = new Date();
    path = [];
    loop();
}


function setup() {
    createCanvas(w_h, w_h);
    noLoop();
    w = w_h / cols;
    h = w_h / rows;
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new Cell(i, j);
        }
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].addNeighbors();
            grid[i][j].addChildNodes(bias);
        }
    }
    current = grid[currentI][currentJ];
    if (maze_generator === "iterative_implementation") {
        current.visited = true;
        stack.push(current)
    }

}

function generateMatrix() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].show();
            if (mazeGeneratorAndPathFindingObject.slider === true) {
                grid[i][j].previous = undefined;
            }
        }
    }
}

function draw() {
    background(51);
    if (mazeGeneratorAndPathFindingObject.createCanvasFlag) {
        mazeGeneratorAndPathFindingObject.createCanvasFlag = false;
        this.generateMatrix();
        if (mazeGeneratorAndPathFindingObject.createMaze !== true) {
            noLoop();
        } else {
            mazeGeneratorAndPathFindingObject.started = true;
        }
    }
    if (mazeGeneratorAndPathFindingObject.started) {
        // frameRate(5);    
        this.generateMatrix();
        if (mazeGeneratorAndPathFindingObject.slider === true) {
            mazeGeneratorAndPathFindingObject.slider = false;
            start = grid[parseInt(document.getElementById("startIndexI").value)][parseInt(document.getElementById("startIndexJ").value)];
            end = grid[parseInt(document.getElementById("endIndexI").value)][parseInt(document.getElementById("endIndexJ").value)];
            start.highlight(color(0, 255, 17));
            end.highlight(color(55, 255, 212));
            noLoop();
        }
        if (mazeGeneratorAndPathFindingObject.mazeCompleted === true) {
            console.log("Maze completed!");
            updateStatus('Maze generated successfully!');
            current.highlight(color(0, 0, 0, 0));
            mazeGeneratorAndPathFindingObject.createMaze = false;
            mazeGeneratorAndPathFindingObject.mazeCompleted = false;
            start = grid[0][0];
            start.count = 0;
            end = grid[cols - 1][rows - 1];
            start.highlight(color(0, 255, 17));
            end.highlight(color(55, 255, 212));
            this.updateHistoryArray();
            noLoop();
        }
        if (mazeGeneratorAndPathFindingObject.createMaze === true) {
            this.updateHistoryArray();
            this.GenerateMaze();
        }
        if (mazeGeneratorAndPathFindingObject.startPathFinding === true) {
            this.PathFinding();
        }
    }
}

function getWallIndex(a, b) {
    if (a.i - b.i === -1) {
        return 1;
    }
    if (a.j - b.j === 1) {
        return 0;
    }
    if (a.i - b.i === 1) {
        return 3;
    }
    if (a.j - b.j === -1) {
        return 2;
    }
    return ""
}

function removeWalls(a, b) {
    let x = a.i - b.i;
    let y = a.j - b.j;
    if (x === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (x === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
    }
    if (y === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (y === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

function removeFromArray(arr, elt) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == elt) {
            arr.splice(i, 1);
        }
    }
}

function heuristic(a, b) {
    let d = dist(a.i, a.j, b.i, b.j);
    // let d = abs(a.i - b.i) + abs(a.j - b.j);
    return d;
}

function GenerateMaze() {
    switch (maze_generator) {
        case "recursive_maze_generator":
            this.Recursive_Maze_Generator();
            break;
        case "iterative_implementation":
            this.Iterative_Implementation();
            break;
        case "binary_tree":
            this.Binary_Tree();
            break;
        default:
            noLoop();
            break;
    }
}

function Recursive_Maze_Generator() {
    current.visited = true;
    current.highlight(color(0, 0, 255, 100));
    let next = current.checkNeighbors();
    if (next) {
        next.visited = true;
        stack.push(current);
        removeWalls(current, next);
        current = next;
    } else if (stack.length > 0) {
        current.highlight(color(0, 0, 0, 0));
        current = stack.pop();
    }
    if (stack.length === 0) {
        mazeGeneratorAndPathFindingObject.mazeCompleted = true;
    }
}

function Iterative_Implementation() {
    if (stack.length !== 0) {
        current = stack.shift();
        current.highlight(color(0, 0, 255, 100));
        let next = current.checkNeighbors();
        if (next) {
            stack.push(current);
            removeWalls(current, next);
            next.visited = true;
            stack.push(next);
        }
    } else {
        mazeGeneratorAndPathFindingObject.mazeCompleted = true;
    }
}

function Binary_Tree() {
    let tempStack = [];
    for (let j = 0; j < rows; j++) {
        if (grid[indexI][j] !== undefined) {
            tempStack.push(grid[indexI][j]);
        }
    }
    while (tempStack.length > 0) {
        if (bias === "se" || bias === "sw") {
            current = tempStack.shift();
        } else if (bias === "nw" || bias === "ne") {
            current = tempStack.pop();
        }
        current.visited = true;
        let next = current.checkChildNodes();
        if (next) {
            removeWalls(current, next);
        }
    }

    if (bias === "se" || bias === "ne") {
        if (indexI < cols) {
            indexI++;
        }
        if (indexI >= cols) {
            mazeGeneratorAndPathFindingObject.mazeCompleted = true;
        }
    } else if (bias === "nw" || bias === "sw") {
        if (indexI >= 0) {
            indexI--;
        }
        if (indexI < 0) {
            mazeGeneratorAndPathFindingObject.mazeCompleted = true;
        }
    }

}

function PathFinding() {
    switch (path_finding) {
        case "a_star":
            this.A_Star();
            break;
        case "sample_algorithm":
            this.Sample_Algorithm();
            break;
        default:
            noLoop();
            break;
    }
}

function A_Star() {
    if (openSet.length > 0) {
        let winner = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }
        current = openSet[winner];
        if (current === end) {
            this.CreatePath();
            noLoop();
            updateStatus('Path found successfully!');
            console.log("DONE!");
        }
        removeFromArray(openSet, current);
        closedSet.push(current);
        let neighbors = current.neighbors;
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (!closedSet.includes(neighbor) && !this.current.walls[this.getWallIndex(current, neighbor)]) {
                let tempG = current.g + heuristic(neighbor, current);
                let newPath = false;
                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }
                if (newPath) {
                    neighbor.h = heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = current;
                }
            }

        }
    } else {
        console.log('no solution');
        updateStatus('No path found!');
        this.CreatePath();
        noLoop();
        return;
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].show();
        }
    }

    for (let i = 0; i < closedSet.length; i++) {
        closedSet[i].show(color(255, 0, 0, 60));
    }

    for (let i = 0; i < openSet.length; i++) {
        openSet[i].show(color(0, 255, 50, 50));
    }
    this.CreatePath();
}

function Sample_Algorithm() {
    let tempQueue = [];
    for (let i = 0; i < queue.length; i++) {
        current = queue[i];
        neighbors = current.neighbors;
        for (let j = 0; j < neighbors.length; j++) {
            let neighbor = neighbors[j];
            if (!current.walls[this.getWallIndex(current, neighbor)]) {
                let index = queue.findIndex((elm) => { return elm.i === neighbor.i && elm.j === neighbor.j });
                if (index === -1) {
                    tempQueue.push(neighbor);
                }
            }
        }
    }
    tempQueue.forEach(element => {
        element.count = count + 1;
    });
    queue = queue.concat(tempQueue);
    count++;
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].show();
        }
    }

    for (let i = 0; i < tempQueue.length; i++) {
        tempQueue[i].show(color(255, 0, 0, 40));
    }

    for (let i = 0; i < queue.length; i++) {
        queue[i].show(color(255, 0, 0, 60));
    }
    this.sampleAlgoFindPath();
    if (this.checkIfAlgoReachedEnd()) {
        this.sampleAlgoFindPath();
        noLoop()
    }
}

function checkIfAlgoReachedEnd() {
    let temp = queue.filter((elm) => { return (elm.i === end.i && elm.j === end.j) });
    if (temp.length === 0) {
        return false;
    } else {
        return true;
    }
}

function CreatePath() {
    path = [];
    let temp = current;
    path.push(temp);
    while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
    }

    this.PathCreator();
}

function sampleAlgoFindPath() {
    path = [];
    current = end;
    path.push(end);
    tcount = count - 1;

    while (tcount > -1) {
        let temp = queue.filter((elm) => { return elm.count === tcount })
        let neighbors = current.neighbors;
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            let index = temp.findIndex((elm) => { return elm.i === neighbor.i && elm.j === neighbor.j })
            if (index !== -1) {
                if (!current.walls[this.getWallIndex(current, neighbor)]) {
                    path.push(neighbor);
                    current = neighbor;
                    break;
                }
            }
        }
        tcount--;
    }
    this.PathCreator();
}

function getIndexByWall(i, j, w_i) {
    let indexs = {};
    indexs.i = i;
    indexs.j = j;
    if (w_i === 0) {
        indexs.j = j - 1;
    }
    if (w_i === 1) {
        indexs.j = j + 1;
    }
    if (w_i === 2) {
        indexs.i = i + 1;
    }
    if (w_i === 3) {
        indexs.i = i - 1;
    }
    return indexs;
}

function PathCreator() {
    noFill();
    stroke(26, 44, 51);
    beginShape();
    for (let i = 0; i < path.length; i++) {
        vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    endShape();
}

function calculateTime() {
    end_time = new Date();
    const diffTime = Math.abs(end_time - start_time);
    return diffTime / 1000;
}

function updateHistoryArray(){
    let update  = history[history.length-1];
    let lastObject = update[Object.keys(update)[Object.keys(update).length - 1]];
    lastObject[Object.keys(lastObject)[Object.keys(lastObject).length - 1]] = this.calculateTime();
    this.updateMazePathUI();
}

function updateMazePathUI(){
    // console.log(history);
    // var elem = document.querySelector('#mazePath');
    // let html = '';
    // for (let index = history.length - 1; index >= 0; index--) {
    //     for (const key in history[index]) {
    //         html += `${key}`;
    //         let temp = history[index][key];
    //         for (const key1 in temp) {
    //             html += `${key1} ${temp[key1]}`
    //         }
    //     }
    // }
    // elem.innerHTML = html;
}