import { to_px, to_pxx, to_pxy, to_inertial_rad, to_rad, to_deg, to_in, clamp, detect_wall, get_sensor_offset, get_wall_offset, get_wall_pos, get_name, loadImage } from './util.js'
import { ctx, canvas, scale, reset_face, wall, canvasWidth_px, canvasHeight_px, kFrontOffset, kPX, kRightOffset, kLeftOffset, fieldWidth_in, fieldHeight_in, distance_max_range, kRearOffset, kTOPWallOffset, kRIGHTWallOffset, kLEFTWallOffset, kBOTTOMWallOffset } from './globals.js'
import { Robot } from './robot.js'
import { Distance } from './distance.js'

const keysPressed = {};
document.addEventListener('keydown', (event) => { keysPressed[event.key] = true; });
document.addEventListener('keyup', (event) => { keysPressed[event.key] = false; });

let fieldPerimeter = loadImage("./assets/field_perimeter.png");

let reset_sensors = {};
reset_sensors[reset_face.FRONT] = new Distance(reset_face.FRONT, 5, 3.5, '#ff4949ff', false);
reset_sensors[reset_face.LEFT] = new Distance(reset_face.LEFT, -6, -4, '#68ff7cff', true);
reset_sensors[reset_face.RIGHT] = new Distance(reset_face.RIGHT, 3, -5, '#f5862cff', false);
reset_sensors[reset_face.REAR] = new Distance(reset_face.REAR, -5, 4, '#1100ffff', false);

let robot = new Robot(
    14, // Width
    14, // Height
    reset_sensors,
    true // Enable telemetry
);

function gameUpdate() {
    let move = .5;
    let rotate = 1;

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

