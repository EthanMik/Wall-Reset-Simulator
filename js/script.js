const keysPressed = {};
document.addEventListener('keydown', (event) => { keysPressed[event.key] = true; });
document.addEventListener('keyup', (event) => { keysPressed[event.key] = false; });

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const scale = 4;
const canvasWidth_px = 144 * scale;
const canvasHeight_px = 144 * scale;

canvas.width = canvasWidth_px
canvas.height = canvasHeight_px

const fieldWidth_in = 1.5
const fieldHeight_in = 1.5

const kPX = 96;

function to_px(inches) { return inches / ((canvasWidth_px / scale) / (fieldWidth_in * scale)) * kPX; }
function to_inertial_rad(deg) { return ((deg - 90) * (Math.PI / 180)); }
function to_deg(rad) { return (rad * 180 / Math.PI); }
function to_in(px) { return px * ((canvasWidth_px / scale) / (fieldWidth_in * scale)) / kPX; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

const reset_face = { FRONT: 0, LEFT: 1, RIGHT: 2, REAR: 3 }; 
const wall = { TOP: 72, LEFT: -72, RIGHT: 72, BOTTOM: -72 };

class distance {
    constructor(reset_face, x_offset, y_offset) {
        this.reset_face = reset_face;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
    }

    get_reset_axis(reset_face, wall, angle) {

    }
}


class Robot {
    constructor(x, y, width, height, angle = 0, odomData = false, color = '#969696ff') {
        this.x_ = to_px(x + wall.RIGHT);
        this.y_ = to_px(-y + wall.TOP);
        this.width_ = to_px(width);
        this.height_ = to_px(height);
        this.angle_ = angle;
        this.odomData_ = odomData;
        this.color_ = color;
    }

    bound_x(x) { return clamp(x, -72 + to_in(this.width_) / 2, 72 - to_in(this.width_) / 2) }
    bound_y(y) { return clamp(y, -72 + to_in(this.height_) / 2, 72 - to_in(this.height_) / 2) }

    set_x(x) { (this.x_ = to_px(this.bound_x(x) + wall.RIGHT)); }
    set_y(y) { this.y_ = to_px(-this.bound_y(y) + wall.TOP); }
    set_angle(angle) { this.angle_ = angle; }

    get_x() { return to_in(this.x_) - wall.RIGHT; }
    get_y() { return -(to_in(this.y_) - wall.TOP); }
    get_angle() { return this.angle_; }

    odom_data() {
        if (!this.odomData_) { return; }
        ctx.save();
        ctx.font = '20px Calibri';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(`θ: ${this.get_angle()}`, 20, 20);
        ctx.fillText(`X: ${this.get_x()}`, 20, 45);
        ctx.fillText(`Y: ${this.get_y()}`, 20, 70);
        ctx.restore();
    }

    chassis() {
        ctx.save();

        ctx.translate(this.x_, this.y_);
        ctx.rotate(to_inertial_rad(this.angle_));
        ctx.fillStyle = this.color_;
        ctx.fillRect(-this.width_ / 2, -this.height_ / 2, this.width_, this.height_);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width_ / 2, 0);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    render() {
        this.odom_data();
        this.chassis();
    }
}

function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

let fieldPerimeter = loadImage("/assets/field_perimeter.png");

let front_reset = new distance(reset_face.FRONT, 0, 0);
let left_reset = new distance(reset_face.LEFT, 0, 0);
let right_reset = new distance(reset_face.RIGHT, 0, 0);
let rear_reset = new distance(reset_face.REAR, 0, 0);

let robot = new Robot(
    0, // Start X
    0, // Start Y
    14, // Width
    14, // Height
    0, // Start Angle
    true // Enable telemetry
);

function gameUpdate() {
    move = .5;
    rotate = 1;

    if (keysPressed['a']) {
        robot.set_x(robot.get_x() - move);
    }
    if (keysPressed['d']) {
        robot.set_x(robot.get_x() + move);
    }
    if (keysPressed['w']) {
        robot.set_y(robot.get_y() + move);
    }
    if (keysPressed['s']) {
        robot.set_y(robot.get_y() - move);
    }
    if (keysPressed['ArrowLeft']) {
        robot.set_angle(robot.get_angle() - rotate);
    }
    if (keysPressed['ArrowRight']) {
        robot.set_angle(robot.get_angle() + rotate);
    }

}

function gameDraw() {
    robot.render();
}

let lastFrameTime = 0;
const fps = 60;
const frameDuration = 1000 / fps;

function gameLoop(timestamp) {
    if (timestamp - lastFrameTime >= frameDuration) {
        lastFrameTime = timestamp;
        ctx.drawImage(fieldPerimeter, 0, 0, canvas.width, canvas.height);
        gameUpdate();
        gameDraw();
    }
    window.requestAnimationFrame(gameLoop);
}

gameLoop();

