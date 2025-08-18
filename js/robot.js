import { to_px, to_pxx, to_pxy, to_inertial_rad, to_rad, to_deg, to_in, clamp, detect_wall, get_sensor_offset, get_wall_offset, get_wall_pos, get_name, loadImage } from './util.js'
import { ctx, canvas, scale, reset_face, wall, canvasWidth_px, canvasHeight_px, kFrontOffset, kPX, kRightOffset, kLeftOffset, fieldWidth_in, fieldHeight_in, distance_max_range, kRearOffset, kTOPWallOffset, kRIGHTWallOffset, kLEFTWallOffset, kBOTTOMWallOffset } from './globals.js'

class Robot {
    constructor(width, height, reset_sensors, odomData = false, color = '#969696ff') {
        this.x_ = 0;
        this.y_ = 0;
        this.width_ = width;
        this.height_ = height;
        this.angle_ = 0;
        this.odomData_ = odomData;
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

        let text_y = 20;
        let text_x = 490;
        let nextline = 15;
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
    
            ctx.strokeStyle = this.reset_sensors[distance].laser_color;
            ctx.lineWidth = 2;
            ctx.stroke();
    
            ctx.font = '16px Calibri';
            ctx.fillStyle = 'white';
            ctx.textBaseline = 'top';
            var axis = this.reset_sensors[distance].get_reset_axis(distance, detect_wall(this.angle_ + offset).name, this.x_, this.y_, this.angle_, get_sensor_offset(distance)); 
            var reset_y = (detect_wall(this.angle_ + offset).name == 'Top' || detect_wall(this.angle_ + offset).name == 'Bottom')
            var far = 0;
            if (reset_y) far = Math.abs(axis - this.y_); 
            if (!reset_y) far = Math.abs(axis - this.x_); 

            ctx.fillStyle = this.reset_sensors[distance].laser_color;
            ctx.fillText(`${get_name(reset_face, distance)}: `, text_x, text_y);
            ctx.fillStyle = 'white';
            text_y += nextline;
            ctx.fillText(`D: ${this.reset_sensors[distance].get_distance(this.x_, this.y_, this.angle_, offset).toFixed(2)}`, text_x, text_y);
            text_y += nextline;
            if (far >= 5 || !far) ctx.fillStyle = '#ff0000ff';
            if (far < 5) ctx.fillStyle = '#ffffffff';
            
            if (reset_y) ctx.fillText(`Y: ${axis.toFixed(2)}`, text_x, text_y);
            if (!reset_y) ctx.fillText(`X: ${axis.toFixed(2)}`, text_x, text_y);
            ctx.fillStyle = 'white';
            text_y += nextline;
            ctx.fillText(`${wall, detect_wall(this.angle_ + offset).name} Wall`, text_x, text_y);
            text_y += nextline * 2;

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
        this.draw_chassis();
        this.draw_odom_data();
        this.draw_reset_sensors();
    }
}

export { Robot };