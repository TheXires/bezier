var max_bezier_depth = 7;    // max recursion depth -> 2^depth segments
var num_points = 6;          // number of control/input point
var CP = Array(num_points);
var line_width = 4;
var point_size = 10;
var back_color = '#f0f0f0';
var line_color = '#ff0000';
var point_color = '#000000';

var canvas;
var ctx;

window.addEventListener('load', function () {
  canvas = document.getElementById('beziers');
  //bonus aufgabe listener registrieren
  canvas.onmousedown = canvasDown;
  canvas.onmouseup = canvasUp;
  canvas.onmousemove = canvasMove;
  canvas.oncontextmenu = canvasOnRightClick;
  // check for browser support
  if (canvas && canvas.getContext) {
    canvas.width = document.body.clientWidth;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousedown', drawVisualization, false);
    window.addEventListener('resize', resizer, false);
    randomize();
    drawVisualization();
  }
}, false);

// Aufgabe 4
document.getElementById('stepI').oninput = () => {
  drawVisualization();
}


function P(x, y) {
  this.x = x;
  this.y = y;
}

function getRandomPoint(width, height) {
  return new P(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
}

function randomize() {
  for (var i = 0; i < num_points; i++) {
    CP[i] = getRandomPoint(canvas.width, canvas.height);
  }
}


let debounceTimestamp;

// Aufgabe 3
/**
 * Draws the graph with the visualization indicators
 */
function drawVisualization() {
  if (debounceTimestamp === undefined || ((new Date().getTime()) - debounceTimestamp) > 20) {
    debounceTimestamp = new Date().getTime();

    let stepI = document.getElementById('stepI').value;
    draw();
    for (var j = 0; j < CP.length - 1; j++) {
      ctx.setLineDash([15, 5]);
      ctx.strokeStyle = '#000000';
      line(CP[j], CP[j + 1]);
    }

    var currentLayerOfPoints = CP;
    do {
      currentLayerOfPoints = computeNextLayer(currentLayerOfPoints, stepI);
      for (var j = 0; j < currentLayerOfPoints.length - 1; j++) {
        ctx.setLineDash([1, 0]);
        ctx.strokeStyle = '#00ff00';
        point(currentLayerOfPoints[j]);
        line(currentLayerOfPoints[j], currentLayerOfPoints[j + 1]);
      }
      point(currentLayerOfPoints[currentLayerOfPoints.length - 1]);
    } while (currentLayerOfPoints.length > 1);
  }
}

function draw() {
  if (ctx) {
    ctx.fillStyle = back_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = line_width;
    ctx.strokeStyle = line_color;
    bezierN(CP, max_bezier_depth);

    for (var i = 0; i < num_points; i++) {
      point(CP[i]);
    }
  }
}

function resizer() {
  if (canvas.width != document.body.clientWidth) {
    canvas.width = document.body.clientWidth;
    randomize();
    drawVisualization();
  }
}

function point(P) {
  ctx.fillStyle = point_color;
  ctx.fillRect(P.x - point_size / 2, P.y - point_size / 2, point_size, point_size);
}

function line(P0, P1) {
  ctx.beginPath();
  ctx.moveTo(P0.x, P0.y);
  ctx.lineTo(P1.x, P1.y);
  ctx.stroke();
}

// Aufgabe 1
/**
 * Draws bezier curve for n depth
 * @param {*} points
 * @param {*} depth
 */
function bezierN(points, depth) {
  if (depth === 0) {
    line(points[0], points[points.length - 1]);
    return;
  }

  var iterativeFirstPoints = [points[0]];
  var iterativeLastPoints = [points[points.length - 1]];

  var currentLayerOfPoints = points;
  do {
    currentLayerOfPoints = computeNextLayer(currentLayerOfPoints, 0.5);
    iterativeFirstPoints.push(currentLayerOfPoints[0]);
    iterativeLastPoints.push(currentLayerOfPoints[currentLayerOfPoints.length - 1]);
  } while (currentLayerOfPoints.length > 1);

  bezierN(iterativeFirstPoints, depth - 1);
  bezierN(iterativeLastPoints, depth - 1);
}

/**
 * Computes the next layer of points by the current points
 * @param {*} points current layer of points
 * @param {*} stepI the weight wo where the 'middle' is on the line between 2 points
 */
function computeNextLayer(points, stepI) {
  var calculated_points = [];
  for (var i = 0; i < points.length - 1; i++) {
    calculated_points[i] = calc(points[i], points[i + 1], stepI);
  }
  return calculated_points;
}

/**
 * Calculates a point between two given points with the amount(0 to 1) stepI of the total length

 * p1 ----------- p2

 *           ^          stepI 0.5
 *
 * p1 ----------- p2
 *
*              ^        stepI 0.7
 *
 * @param p1
 * @param p2
 * @param stepI
 * @returns the point in the middle(or selected amount if not 0.5)
 */
function calc(p1, p2, stepI) {
  return new P(((1 - stepI) * p1.x + stepI * p2.x), ((1 - stepI) * p1.y + stepI * p2.y));
}


// Bonus
// indicates if drag n drop is in progress when a point gets moved
let dragInProgress = false;
// indicates the currently dragged point by its index in the array
let draggedPointIndex;

/**
 * Handles the mouse down event for drag n drop functionality
 * @param {*} event
 */
function canvasDown(event) {
  if (event.which === 1) {
    const pointResult = calculateNearestPoint(calcMousePositionOnCanvas(event));
    if (pointResult.distance < 10) {
      dragInProgress = true;
      draggedPointIndex = CP.findIndex(e => (e.x === pointResult.point.x && e.y === pointResult.point.y));
      canvas.style.cursor = "grabbing";
    }
  }
}

/**
 * Handles the mouse up event for drag n drop functionality
 * @param {*} event
 */
function canvasUp(event) {
  dragInProgress = false;
  canvas.style.cursor = "default";
}

/**
 * Handles the right click event on the canvas to add or remove points
 * @param {*} event
 */
function canvasOnRightClick(event) {
  const pointResult = calculateNearestPoint(calcMousePositionOnCanvas(event));
  if (pointResult.distance < 10) {
    event.preventDefault();
    let clickedPointIndex = CP.findIndex(e => (e.x === pointResult.point.x && e.y === pointResult.point.y));
    if (CP.length > 2) {
      CP = CP.filter(e => e !== CP[clickedPointIndex]);
      num_points--;
      drawVisualization();
    }
  } else {
    event.preventDefault();
    CP[CP.length] = calcMousePositionOnCanvas(event);
    num_points++;
    drawVisualization();
  }
}

/**
 * Handles the mouse move event to make the drag n drop work
 * @param {*} event
 */
function canvasMove(event) {
  if (!dragInProgress) {
    if (calculateNearestPoint(calcMousePositionOnCanvas(event)).distance < 10) {
      canvas.style.cursor = "grab";
    } else {
      canvas.style.cursor = "default";
    }
  }

  if (dragInProgress) {
    CP[draggedPointIndex] = calcMousePositionOnCanvas(event);
    drawVisualization();
  }
}

/**
 * Calculates the correct mouse position coordinates on the canvas
 * @param {*} event
 */
function calcMousePositionOnCanvas(event) {
  const canvasRect = canvas.getBoundingClientRect();
  const x = event.clientX - canvasRect.left;
  const y = event.clientY - canvasRect.top;
  return new P(x, y);
}

/**
 * Calculates the nearest point of the point array to the mouse coords
 * @param {*} mouseCoords
 */
function calculateNearestPoint(mouseCoords) {
  const distances = [];
  CP.forEach((currentPoint, index) => {
    distances[index] = {
      distance: Math.sqrt(Math.pow(mouseCoords.x - currentPoint.x, 2) + Math.pow(mouseCoords.y - currentPoint.y, 2)),
      point: new P(currentPoint.x, currentPoint.y)
    };
  });
  distances.sort((a, b) => a.distance - b.distance);
  return distances[0];
}