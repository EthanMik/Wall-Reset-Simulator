import { ctx, canvas, scale, reset_face, wall, canvasWidth_px, canvasHeight_px, kFrontOffset, kPX, kRightOffset, kLeftOffset, fieldWidth_in, fieldHeight_in, distance_max_range, kRearOffset, kTOPWallOffset, kRIGHTWallOffset, kLEFTWallOffset, kBOTTOMWallOffset } from './globals.js'

function to_px(inches) { return inches / ((canvasWidth_px / scale) / (fieldWidth_in * scale)) * kPX; }
function to_pxx(inches) { return to_px(inches + 72); }
function to_pxy(inches) { return to_px(72 - inches); }
function to_inertial_rad(deg) { return ((deg - 90) * (Math.PI / 180)); }
function to_rad(deg) { return deg * Math.PI / 180; }
function to_deg(rad) { return (rad * 180 / Math.PI); }
function to_in(px) { return px * ((canvasWidth_px / scale) / (fieldWidth_in * scale)) / kPX; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

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
            const lower = key.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        }
    }
    return '';
}

function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

export { to_px, to_pxx, to_pxy, to_inertial_rad, to_rad, to_deg, to_in, clamp, detect_wall, get_sensor_offset, get_wall_offset, get_wall_pos, get_name, loadImage };