import { to_px, to_pxx, to_pxy, to_inertial_rad, to_rad, to_deg, to_in, clamp, detect_wall, get_sensor_offset, get_wall_offset, get_wall_pos, get_name, loadImage } from './util.js'
import { ctx, canvas, scale, reset_face, wall, canvasWidth_px, canvasHeight_px, kFrontOffset, kPX, kRightOffset, kLeftOffset, fieldWidth_in, fieldHeight_in, distance_max_range, kRearOffset, kTOPWallOffset, kRIGHTWallOffset, kLEFTWallOffset, kBOTTOMWallOffset } from './globals.js'
import { Robot } from './robot.js'
import { Distance } from './distance.js'
import { control, draw_field_control } from './control.js'

let reset_sensors = {};
reset_sensors[reset_face.FRONT] = new Distance(
    reset_face.FRONT, 
    5, // Sensor X-Offset
    3.5, // Sensor Y-Offset
    '#ff4949ff', // Laser Color
    true // Render Sensor
);

reset_sensors[reset_face.LEFT] = new Distance(reset_face.LEFT, -6, -4, '#68ff7cff', false);
reset_sensors[reset_face.RIGHT] = new Distance(reset_face.RIGHT, 3, -5, '#f5862cff', false);
reset_sensors[reset_face.REAR] = new Distance(reset_face.REAR, -5, 4, '#1100ffff', false);

let robot = new Robot(
    14, // Width
    14, // Height
    reset_sensors, // Reset sensor
    true // Enable telemetry
);

function update() {
    draw_field_control();
    robot.render();
    control(robot);
}

let lastFrameTime = 0;
const fps = 60;
const frameDuration = 1000 / fps;

function render(timestamp) {
    if (timestamp - lastFrameTime >= frameDuration) {
        lastFrameTime = timestamp;
        update();
    }
    window.requestAnimationFrame(render);
}

render();

