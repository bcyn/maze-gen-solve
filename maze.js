var width = window.innerWidth;
var height = window.innerHeight;

var COLOR_BLACK = '#000';
var COLOR_GREY = '#333';
var COLOR_WHITE = '#FFF';

var N = 1 << 0;
var S = 1 << 1;
var W = 1 << 2;
var E = 1 << 3;
var visited = 1 << 4;

var cellDim = 1;
var cellSpace = 3;
var wCells = Math.floor((width - cellSpace) / (cellDim + cellSpace));
var hCells = Math.floor((height - cellSpace) / (cellDim + cellSpace));
var cells = generateMaze(wCells, hCells);

var parent = d3.range(wCells * hCells)
    .map(function() { return NaN; });
var previous = (hCells - 1) * wCells;
var goalX = wCells - 1;
var goalY = 0;
var goalIndex = goalX + goalY * wCells;
var frontier = [previous];

var xCanvas = Math.round((width - wCells * cellDim - (wCells + 1) * cellSpace) / 2);
var yCanvas = Math.round((height - hCells * cellDim - (hCells + 1) * cellSpace) / 2);

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);
var context = canvas.node().getContext("2d");
context.translate(xCanvas, yCanvas);
context.fillStyle = COLOR_GREY;

for (var i = 0; i < wCells; ++i) {
    for (var j = 0; j < hCells; ++j) {
        if (cells[j * wCells + i] >= 0) 
            context.fillRect(i * cellDim + (i + 1) * cellSpace, 
                j * cellDim + (j + 1) * cellSpace, 
                cellDim, 
                cellDim);
        if (cells[j * wCells + i] & E) 
            context.fillRect((i + 1) * (cellDim + cellSpace), 
                j * cellDim + (j + 1) * cellSpace, 
                cellSpace, 
                cellDim);
        if (cells[j * wCells + i] & S) 
            context.fillRect(i * cellDim + (i + 1) * cellSpace, 
                (j + 1) * (cellDim + cellSpace), 
                cellDim, 
                cellSpace);
    }
}

context.lineWidth = cellDim;
context.lineCap = "square";
context.strokeStyle = COLOR_GREY;
context.translate(cellDim / 2, cellDim / 2);

var randomBase = Math.random() * 360 | 0;
var randomSat = Math.random() * (0.8 - 0.4) + 0.4;
var randomLight = Math.random() * (0.6 - 0.4) + 0.4;

d3.timer(function() {
    var done;
    var k = 0;
    while (++k < 20 && !(done = explore()));
    return done;
});

function explore() {
    if ((i0 = popRandom(frontier)) == null) return true;

    var i0;
    var x0 = i0 % wCells;
    var y0 = i0 / wCells | 0;
    var s0 = score(i0);
    var i1;

    cells[i0] |= visited;

    var maxDist = Math.pow(Math.pow(wCells - 1, 2) + Math.pow(0 - hCells - 1, 2), 0.5);
    var dist = Math.pow(Math.pow(x0 - 0, 2) + Math.pow(y0 - hCells - 1, 2), 0.5);
    // dist *= 1;
    dist = dist / maxDist;

    // var color = d3.hsl(((dist + randomBase)% 360), randomSat, randomLight).rgb();
    var color = d3.hsl(
            (randomBase + (120) * (dist)) % 360,
            randomSat + (1 - randomSat) * (dist),
            randomLight + (0.8 - randomLight) * (dist)
        ).rgb();

    context.strokeStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
    strokePath(previous);

    context.strokeStyle = COLOR_WHITE;
    strokePath(previous = i0);
    if (!s0) return true;

    if (cells[i0] & N && !(cells[i1 = i0 - wCells] & visited)) parent[i1] = i0, frontier.push(i1);
    if (cells[i0] & S && !(cells[i1 = i0 + wCells] & visited)) parent[i1] = i0, frontier.push(i1);
    if (cells[i0] & W && !(cells[i1 = i0 - 1] & visited)) parent[i1] = i0, frontier.push(i1);
    if (cells[i0] & E && !(cells[i1 = i0 + 1] & visited)) parent[i1] = i0, frontier.push(i1);
}

function strokePath(index) {
    context.beginPath();
    moveTo(index);
    while (!isNaN(index = parent[index])) lineTo(index);
    context.stroke();
}

function moveTo(index) {
    var i = index % wCells;
    var j = index / wCells | 0;
    context.moveTo(i * cellDim + (i + 1) * cellSpace, j * cellDim + (j + 1) * cellSpace);
}

function lineTo(index) {
    var i = index % wCells;
    var j = index / wCells | 0;
    context.lineTo(i * cellDim + (i + 1) * cellSpace, j * cellDim + (j + 1) * cellSpace);
}

function score(i) {
    var x = goalX - (i % wCells);
    var y = goalY - (i / wCells | 0);
    return x * x + y * y;
}

function popRandom(array) {
    if (!(n = array.length))
        return;

    var i = Math.random() * n | 0,
        t = array[i];
    array[i] = array[n - 1];
    array[n - 1] = t;
    return array.pop();
}

function generateMaze(width, height) {
    console.log('generation');
    var cells = new Array(width * height);
    var remaining = d3.range(width * height);
    var previous = new Array(width * height);

    // TODO: randomize this instead of pop
    var start = remaining.pop();
    cells[start] = 0;
    while (!randomWalk());
    return cells;

    function randomWalk() {
        var direction;
        var index0;
        var index1;
        var i;
        var j;
    
        do {
            if ((index0 = remaining.pop()) == null) 
                return true;
        }
        while (cells[index0] >= 0);

        previous[index0] = index0;

        walk: while (true) {
            i = index0 % width;
            j = index0 / width | 0;
            direction = Math.random() * 4 | 0;
            if (direction == 0) {
                if (j == 0) {
                    continue walk;
                }
                --j;
            } else if (direction == 1) {
                if (j == height - 1) {
                    continue walk;
                }
                ++j;
            } else if (direction == 2) {
                if (i == 0) {
                    continue walk;
                }
                --i;
            } else {
                if (i == width - 1) {
                    continue walk;
                }
                ++i;
            }

            index1 = j * width + i;
            if (previous[index1] >= 0) {
                eraseWalk(index0, index1);
            } else {
                previous[index1] = index0;
            }
            index0 = index1;

            if (cells[index1] >= 0) {
                while((index0 = previous[index1]) != index1) {
                    direction = index1 - index0;
                    if (direction == 1) {
                        cells[index0] |= E;
                        cells[index1] |= W;
                    } else if (direction == -1) {
                        cells[index0] |= W;
                        cells[index1] |= E;
                    } else if (direction < 0) {
                        cells[index0] |= N;
                        cells[index1] |= S;
                    } else {
                        cells[index0] |= S;
                        cells[index1] |= N;
                    }
                    previous[index1] = NaN;
                    index1 = index0;
                }
                previous[index1] = NaN;
                return;
            }
        }
    }

    function eraseWalk(index0, index1) {
        var index;
        while ((index = previous[index0]) != index1) {
            previous[index0] = NaN;
            index0 = index;
        }
        previous[index0] = NaN;
    }
}


