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
function to_pxx(inches) { return to_px(inches + 72); }
function to_pxy(inches) { return to_px(72 - inches); }
function to_inertial_rad(deg) { return ((deg - 90) * (Math.PI / 180)); }
function to_rad(deg) { return deg * Math.PI / 180; }
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
    constructor(width, height, odomData = false, color = '#969696ff') {
        this.x_ = 0;
        this.y_ = 0;
        this.width_ = width;
        this.height_ = height;
        this.angle_ = 0;
        this.odomData_ = odomData;
        this.color_ = color;
    }

    set_x(x) { (this.x_ = clamp(x, -72 + this.width_ / 2, 72 - this.width_ / 2)); }
    set_y(y) { this.y_ =  clamp(y, -72 + this.height_ / 2, 72 - this.height_ / 2); }
    set_angle(angle) { this.angle_ = ((angle % 360) + 360) % 360; }

    get_x() { return this.x_; }
    get_y() { return this.y_ }
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

    ray_cast(x_offset, y_offset) {
        // angle in radians, x/y are center of robot
        const dx = Math.cos(to_rad(this.angle_));
        const dy = Math.sin(to_rad(this.angle_));

        let tMax = 0;
        const x = this.x_ + x_offset
        const y = this.y_ - y_offset

        // Right wall
        // if (dx > 0) tMax = Math.min(tMax, (wall.RIGHT - this.x_) / dx);
        // Left wall
        // if (dx < 0) tMax = Math.min(tMax, (0 - this.x_) / dx);
        // Bottom wall
        // if (dy > 0) tMax = Math.min(tMax, (canvasHeight - this.y_) / dy);
        // Top wall
        if (dx > 0) tMax = (wall.TOP - y) / dy;
        console.log(dx > 0);

        // End point of ray
        const end_x = x + dx * tMax;
        const end_y = y + dy * tMax;
        const distance = Math.sqrt((end_x - x) ** 2 + (end_y - y) ** 2);

        return { end_x, end_y, distance };
    }

    reset_sensors() {
        ctx.save();

        const ray = this.ray_cast(0, 0);
        ctx.beginPath();
        ctx.moveTo(to_pxx(this.x_), to_pxy(this.y_));
        ctx.lineTo(to_pxx(ray.end_x), to_pxy(ray.end_y));
        ctx.strokeStyle = '#2fff74ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '20px Calibri';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(`Distance: ${ray.distance.toFixed(2)}`, 20, 95);

        ctx.restore();
    }

    chassis() {
        ctx.save();

        ctx.translate(to_px(this.x_ + 72), to_px(-this.y_ + 72));
        ctx.rotate(to_inertial_rad(this.angle_));
        ctx.fillStyle = this.color_;
        ctx.fillRect(-to_px(this.width_) / 2, -to_px(this.height_) / 2, to_px(this.width_), to_px(this.height_));

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(to_px(this.width_) / 2, 0);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    render() {
        this.odom_data();
        this.chassis();
        this.reset_sensors();
    }
}

function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

let fieldPerimeter = loadImage("./assets/field_perimeter.png");

let front_reset = new distance(reset_face.FRONT, 0, 0);
let left_reset = new distance(reset_face.LEFT, 0, 0);
let right_reset = new distance(reset_face.RIGHT, 0, 0);
let rear_reset = new distance(reset_face.REAR, 0, 0);

let robot = new Robot(
    14, // Width
    14, // Height
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

