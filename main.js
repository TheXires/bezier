var canvas;
var ctx;

window.addEventListener('load', function () {
  canvas = document.getElementById('beziers');
  // check for browser support
  if (canvas && canvas.getContext) {
    canvas.width = document.body.clientWidth;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousedown', draw, false);
    window.addEventListener('resize', resizer, false);
    if (ctx) {
      draw();
    }
  }
}, false);

function P(x, y) {
  this.x = x;
  this.y = y;
}

function getRandomPoint(width, height) {
  return new P(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
}

var max_bezier_depth = 5;    // max recursion depth -> 2^depth segments
var num_points = 4;          // number of control/input point
var CP = Array(num_points);
var line_width = 2;
var point_size = 4;
var back_color = '#206020';
var line_color = '#f0f0f0';
var point_color = '#d0d020';

function draw() {
  for (var i = 0; i < num_points; i++) {
    CP[i] = getRandomPoint(canvas.width, canvas.height);
  }
  if (ctx) {
    ctx.fillStyle = back_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = line_width;
    ctx.strokeStyle = line_color;
    bezier(CP);

    for (var i = 0; i < num_points; i++) {
      point(CP[i]);
    }
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

function bezier4(P0, P1, P2, P3, depth) {
  if (depth === 0) {
    line(P0, P3);
  } else {
    var P01 = new P(0.5 * (P0.x + P1.x), 0.5 * (P0.y + P1.y));
    var P12 = new P(0.5 * (P1.x + P2.x), 0.5 * (P1.y + P2.y));
    var P23 = new P(0.5 * (P2.x + P3.x), 0.5 * (P2.y + P3.y));

    var P012 = new P(0.5 * (P01.x + P12.x), 0.5 * (P01.y + P12.y));
    var P123 = new P(0.5 * (P12.x + P23.x), 0.5 * (P12.y + P23.y));

    var P0123 = new P(0.5 * (P012.x + P123.x), 0.5 * (P012.y + P123.y));

    bezier4(P0, P01, P012, P0123, depth - 1);
    bezier4(P0123, P123, P23, P3, depth - 1);
  }
}

function bezier(points) {
  if (points.length == 4) {
    bezier4(points[0], points[1], points[2], points[3], max_bezier_depth);
  }
}

function resizer() {
  if (canvas.width != document.body.clientWidth) {
    canvas.width = document.body.clientWidth;
    console.log(canvas.width, canvas.height);
    draw();
  }
}