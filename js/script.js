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

const distance_max_range = 78;

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
const wall = { TOP: 70, LEFT: -70, RIGHT: 70, BOTTOM: -70 };

const kFrontOffset = 0;
const kRightOffset = 90;
const kLeftOffset = 270;
const kRearOffset = 180;

const kTOPWallOffset = 180;
const kRIGHTWallOffset = 90;
const kLEFTWallOffset = 90;
const kBOTTOMWallOffset = 180;

function detect_wall(angle) { 
    let name = '';
    let wall_pos = 0; 
    if (angle < 45 || angle >= 315) {
        name = 'Top';
        wall_pos = wall.TOP;
        return {name, wall_pos};
    } 
    if (angle < 135) {
        name = 'Right';
        wall_pos = wall.RIGHT;
        return {name, wall_pos};
    } 
    if (angle < 225) {
        name = 'Bottom';
        wall_pos = wall.BOTTOM;
        return {name, wall_pos};
    }
    name = 'Left';
    wall_pos = wall.LEFT;
    return {name, wall_pos};
}

function get_sensor_offset(index) {
    switch (index) { 
        case 0: return kFrontOffset;
        case 1: return kLeftOffset;
        case 2: return kRightOffset;
        case 3: return kRearOffset;
        default: return 0;
    }    
}

function get_wall_offset(wall) {
    switch (wall) {
        case "Top": return kTOPWallOffset;
        case "Left": return kLEFTWallOffset;
        case "Right": return kRIGHTWallOffset;
        case "Bottom": return kBOTTOMWallOffset;
        default: return 0;
    }    
}

function get_wall_pos(wall_) {
    switch (wall_) {
        case "Top": return wall.TOP;
        case "Left": return wall.LEFT;
        case "Right": return wall.RIGHT;
        case "Bottom": return wall.BOTTOM;
        default: return 0;
    }    
}

function get_name(enum_name, value) {
    for (const key in enum_name) {
        if (enum_name[key] === value) {
            return key.toLowerCase();
        }
    }
    return '';
}

class distance {
    constructor(reset_face, x_offset, y_offset, render = true) {
        this.reset_face = reset_face;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.render = render;
    }

    get_reset_axis(reset_sensor, wall, x, y, angle, offset) {
        if (reset_sensor != this.reset_face) { return; }

        // From mikLib distance.cpp
        const sensor_offset = offset;
        const wall_offset = get_wall_offset(wall);
        const wall_pos = get_wall_pos(wall);
        
        const distance = this.get_distance(x, y, angle, offset);
        const x_offset = this.x_offset;
        const y_offset = this.y_offset;
        const theta = angle + wall_offset + sensor_offset; 

        return (wall_pos + (Math.cos(to_rad(theta)) * (distance + y_offset)) - (Math.sin(to_rad(angle + wall_offset)) * x_offset));        
    }

    get_distance(x, y, angle, offset) {
        return this.ray_cast(x, y, angle, offset).distance;
    }

    ray_cast(robot_x, robot_y, robot_angle, offset) {
        const angle = to_inertial_rad(robot_angle + offset);
        const global_angle = to_inertial_rad(robot_angle);
        const dx = Math.cos(angle);
        const dy = -Math.sin(angle);

        const offset_x = this.y_offset * Math.cos(global_angle) + this.x_offset * -Math.sin(global_angle);
        const offset_y = this.y_offset * -Math.sin(global_angle) - this.x_offset * Math.cos(global_angle);

        const x = robot_x + offset_x;
        const y = robot_y + offset_y;

        let tMax = Infinity;

        if (dx > 0) tMax = Math.min(tMax, (wall.RIGHT - x) / dx);
        if (dx < 0) tMax = Math.min(tMax, (wall.LEFT - x) / dx);
        if (dy > 0) tMax = Math.min(tMax, (wall.TOP - y) / dy);
        if (dy < 0) tMax = Math.min(tMax, (wall.BOTTOM - y) / dy);

        var start_x = x;
        var start_y = y;
        var end_x = x + dx * tMax;
        var end_y = y + dy * tMax;
        var distance = Math.sqrt((end_x - x) ** 2 + (end_y - y) ** 2);

        if (distance > distance_max_range) {
            end_x = x;
            end_y = y;
            distance = NaN;
        }

        return { start_x, start_y, end_x, end_y, distance };
    }
}


class Robot {
    constructor(width, height, reset_sensors, odomData = false, color = '#969696ff') {
        this.x_ = 0;
        this.y_ = 0;
        this.width_ = width;
        this.height_ = height;
        this.angle_ = 0;
        this.odomData_ = odomData;
        this.reset_sensors = {};
        this.reset_sensors = reset_sensors
        this.color_ = color;
    }

    set_x(x) { (this.x_ = clamp(x, -72 + this.width_ / 2, 72 - this.width_ / 2)); }
    set_y(y) { this.y_ =  clamp(y, -72 + this.height_ / 2, 72 - this.height_ / 2); }
    set_angle(angle) { this.angle_ = ((angle % 360) + 360) % 360; }

    get_x() { return this.x_; }
    get_y() { return this.y_ }
    get_angle() { return this.angle_; }

    draw_odom_data() {
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

    draw_reset_sensors() {
        ctx.save();

        let text_height = 95;
        for (const distance of Object.values(reset_face)) {
            if (this.reset_sensors[distance].render == false) { continue; }
            let offset = get_sensor_offset(distance);
            const ray = this.reset_sensors[distance].ray_cast(this.x_, this.y_, this.angle_, offset);

            ctx.beginPath();
            ctx.moveTo(to_pxx(ray.start_x), to_pxy(ray.start_y));
            ctx.lineTo(to_pxx(ray.end_x), to_pxy(ray.end_y));
    
            const rectWidth = 10;
            const rectHeight = 5;
            ctx.save();
            ctx.translate(to_pxx(ray.start_x), to_pxy(ray.start_y));
            ctx.rotate(to_inertial_rad(this.angle_ + offset));
            ctx.fillStyle = '#1b1717ff';
            ctx.fillRect(-rectWidth/2, -rectHeight/2, rectWidth, rectHeight);
            ctx.restore();
    
            ctx.strokeStyle = '#ff4d40ff';
            ctx.lineWidth = 2;
            ctx.stroke();
    
            ctx.font = '20px Calibri';
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'top';
            ctx.fillText(`${get_name(reset_face, distance)}: ${this.reset_sensors[distance].get_distance(this.x_, this.y_, this.angle_, offset).toFixed(2)}`, 20, text_height);
            text_height += 25;

            ctx.restore();
        }
    }

    draw_chassis() {
        ctx.save();

        ctx.translate(to_pxx(this.x_), to_pxy(this.y_));
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
        this.draw_odom_data();
        this.draw_chassis();
        this.draw_reset_sensors();

        var x = reset_sensors[reset_face.FRONT].get_reset_axis(reset_face.FRONT, detect_wall(this.angle_).name, this.x_, this.y_, this.angle_, get_sensor_offset(reset_face.FRONT)); 
        ctx.save();
        ctx.font = '20px Calibri';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(`${x.toFixed(5)}`, 20, 200);
        ctx.fillText(`${wall, detect_wall(this.angle_).name}`, 20, 225);
        ctx.restore();
        
    }
}

function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

let fieldPerimeter = loadImage("./assets/field_perimeter.png");

let reset_sensors = {};
reset_sensors[reset_face.FRONT] = new distance(reset_face.FRONT, 5, 3.5, true);
reset_sensors[reset_face.LEFT] = new distance(reset_face.LEFT, -6, -4, true);
reset_sensors[reset_face.RIGHT] = new distance(reset_face.RIGHT, 0, 5, false);
reset_sensors[reset_face.REAR] = new distance(reset_face.REAR, -5, 4, false);

let robot = new Robot(
    14, // Width
    14, // Height
    reset_sensors,
    true // Enable telemetry
);

robot.set_angle(180);

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

