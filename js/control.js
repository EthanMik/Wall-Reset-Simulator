import { to_px, to_pxx, to_pxy, to_inertial_rad, to_rad, to_deg, to_in, clamp, detect_wall, get_sensor_offset, get_wall_offset, get_wall_pos, get_name, loadImage } from './util.js'
import { ctx, canvas, scale, reset_face, wall, canvasWidth_px, canvasHeight_px, kFrontOffset, kPX, kRightOffset, kLeftOffset, fieldWidth_in, fieldHeight_in, distance_max_range, kRearOffset, kTOPWallOffset, kRIGHTWallOffset, kLEFTWallOffset, kBOTTOMWallOffset } from './globals.js'
import { Robot } from './robot.js'

const keysPressed = Object.create(null);
const keysHandled = Object.create(null);

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
    keysHandled[event.key] = false;
});

canvas.addEventListener('mousedown', (event) => {
  if (event.button === 0) {
    keysPressed.MouseLeft = true;
  }
});

window.addEventListener('mouseup', (event) => {
  if (event.button === 0) {
    keysPressed.MouseLeft = false;
    keysHandled.MouseLeft = false;
  }
});

function new_press(key) {
    return keysPressed[key] && !keysHandled[key];
}

let empty_field = loadImage("./assets/empty_field.png");
let push_back_skills_field = loadImage("./assets/high_stakes_skills.png");
let high_stakes_skills_field = loadImage("./assets/push_back_skills.png");

function draw_field(field) {
    switch(field) {
        case 0:
            ctx.drawImage(empty_field, 0, 0, canvas.width, canvas.height);
            return;
        case 1:
            ctx.drawImage(push_back_skills_field, 0, 0, canvas.width, canvas.height);
            return;
        case 2:
            ctx.drawImage(high_stakes_skills_field, 0, 0, canvas.width, canvas.height);
            return;
    }
}

let field = 0;

function draw_field_control() {
    if (new_press('MouseLeft')) {
        keysHandled['MouseLeft'] = true;
        field++;
        if (field >= 3) {
            field = 0;
        }
    }
    draw_field(field);
}

let render_front_distance = true;
let render_left_distance = false;
let render_right_distance = false;
let render_rear_distance = false;

function control(robot) {
    const move = 0.5;
    const rotate = 1;

    if (new_press('1')) {
        keysHandled['1'] = true;
        render_front_distance = !render_front_distance;
        robot.reset_sensors[reset_face.FRONT].render = render_front_distance;
    }
    if (new_press('2')) {
        keysHandled['2'] = true;
        render_left_distance = !render_left_distance;
        robot.reset_sensors[reset_face.LEFT].render = render_left_distance;
    }
    if (new_press('3')) {
        keysHandled['3'] = true;
        render_right_distance = !render_right_distance;
        robot.reset_sensors[reset_face.RIGHT].render = render_right_distance;
    }
    if (new_press('4')) {
        keysHandled['4'] = true;
        render_rear_distance = !render_rear_distance;
        robot.reset_sensors[reset_face.REAR].render = render_rear_distance;
    }
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

export { control, draw_field_control };