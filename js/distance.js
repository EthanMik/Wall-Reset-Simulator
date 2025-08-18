import { to_px, to_pxx, to_pxy, to_inertial_rad, to_rad, to_deg, to_in, clamp, detect_wall, get_sensor_offset, get_wall_offset, get_wall_pos, get_name, loadImage } from './util.js'
import { ctx, canvas, scale, reset_face, wall, canvasWidth_px, canvasHeight_px, kFrontOffset, kPX, kRightOffset, kLeftOffset, fieldWidth_in, fieldHeight_in, distance_max_range, kRearOffset, kTOPWallOffset, kRIGHTWallOffset, kLEFTWallOffset, kBOTTOMWallOffset } from './globals.js'

class Distance {
    constructor(reset_face, x_offset, y_offset, laser_color = 'red', render = true) {
        this.reset_face = reset_face;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.laser_color = laser_color;
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
        
        const reset_y = (wall == 'Top' || wall == 'Bottom');
        const reset_x = (wall == 'Left' || wall == 'Right');

        if (reset_x) {
            return wall_pos + (Math.cos(to_rad(theta)) * distance) - (Math.cos(to_rad(angle)) * x_offset) - (Math.sin(to_rad(angle)) * y_offset)
        }
        if (reset_y) {
            return wall_pos + (Math.sin(to_rad(theta)) * distance) + (Math.sin(to_rad(angle)) * x_offset) - (Math.cos(to_rad(angle)) * y_offset)
        }

        return NaN;

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

export { Distance };