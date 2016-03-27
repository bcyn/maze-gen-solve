var width = window.innerWidth;
var height = window.innerHeight;

var COLOR_BLACK = '#000';

var N = 1 << 0;
var S = 1 << 1;
var W = 1 << 2;
var E = 1 << 3;
var visited = 1 << 4;

var cellDim = 2;
var cellSpace = 1;
var wCells = Math.floor((width - cellSpace) / (cellDim + cellSpace));
var hCells = Math.floor((height - cellSpace) / (cellDim + cellSpace));
var cells = generateMaze(wCells, hCells);

var cellArray = d3.range(wCells * hCells)
    .map(function() { return NaN; });

var xCanvas = Math.round((width - wCells * cellDim - (wCells + 1) * cellSpace) / 2);
var yCanvas = Math.round((height - hCells * cellDim - (hCells + 1) * cellSpace) / 2);

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);
var context = canvas.node().getContext("2d");
context.translate(xCanvas, yCanvas);
context.fillStyle = COLOR_BLACK;

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
