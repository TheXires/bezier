var max_bezier_depth = 10;    // max recursion depth -> 2^depth segments
var num_points = 4;          // number of control/input point
var CP = Array(num_points);
var line_width = 4;
var point_size = 10;
var back_color = '#ffffff';
var line_color = '#ff0000';
var point_color = '#000000';

var canvas;
var ctx;

window.addEventListener('load', function () {
  canvas = document.getElementById('beziers');
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


// Aufgabe 3
function drawVisualization() {
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

function computeNextLayer(points, stepI) {
  var calculated_points = [];
  for (var i = 0; i < points.length - 1; i++) {
    calculated_points[i] = calc(points[i], points[i + 1], stepI);
  }
  return calculated_points;
}

function calc(p1, p2, stepI) {
  return new P(((1 - stepI) * p1.x + stepI * p2.x), ((1 - stepI) * p1.y + stepI * p2.y));
}