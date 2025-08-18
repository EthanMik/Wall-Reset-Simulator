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

const reset_face = { FRONT: 0, LEFT: 1, RIGHT: 2, REAR: 3 }; 
const wall = { TOP: 70, LEFT: -70, RIGHT: 70, BOTTOM: -70 };

const kFrontOffset = 0;
const kRightOffset = 90;
const kLeftOffset = 270;
const kRearOffset = 180;

const kTOPWallOffset = 270;
const kRIGHTWallOffset = 90;
const kLEFTWallOffset = 90;
const kBOTTOMWallOffset = 270;

export { ctx, canvas, scale, reset_face, wall, canvasWidth_px, canvasHeight_px, kFrontOffset, kPX, kRightOffset, kLeftOffset, fieldWidth_in, fieldHeight_in, distance_max_range, kRearOffset, kTOPWallOffset, kRIGHTWallOffset, kLEFTWallOffset, kBOTTOMWallOffset };