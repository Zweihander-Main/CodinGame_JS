declare const readline: any;

interface Coord {
	x: number;
	y: number;
}

let boostLeft = 1;
let lastLoc = {} as Coord;
let lastCheckPointLoc = {};
let lastAngle;
let loop = 0;
const CHECK_POINT_SIZE_BUFFER = 400;
const MAX_SPEED = 800;
const MIN_THRUST = 10;
const BOOST = -1;

function distanceBetweenTwoPoints(point1, point2) {
	return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

function isWithin(toCheck, within) {
	return Math.abs(toCheck) < within;
}

/*
 * Calculates the angle ABC (in radians)
 *
 * A first point, ex: {x: 0, y: 0}
 * C second point
 * B center point
 */
function findDriftAngle(A, B, C) {
	let AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
	let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
	let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
	let rad = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
	return (rad * 180) / Math.PI;
}

function driftCompensate(Dest: Coord, Cur: Coord, Prev: Coord) {
	const target = {} as Coord;
	target.x = Dest.x - (Cur.x - Prev.x);
	target.y = Dest.y - (Cur.y - Prev.y);
	return target;
}

// game loop
while (true) {
	let thrust = 100; // (0 <= thrust <= 100)
	let recMaxSpeed = MAX_SPEED;
	const [x, y, nextX, nextY, nextDist, nextAngle] = readline().split(' ');
	const loc: Coord = { x: x, y: y };
	const checkPointLoc: Coord = { x: nextX, y: nextY };
	if (loop === 0) {
		lastLoc = loc;
		lastCheckPointLoc = checkPointLoc;
	}
	let targetLoc: Coord = checkPointLoc;
	const [oppX, oppY] = readline().split(' ');
	const distanceToEdge = nextDist - CHECK_POINT_SIZE_BUFFER;

	let speed = distanceBetweenTwoPoints(lastLoc, loc);
	let driftAngle = findDriftAngle(lastCheckPointLoc, lastLoc, loc);

	// as distance gets lower, max speed should get lower
	if (distanceToEdge < 2500) {
		recMaxSpeed = (distanceToEdge / 2500) * MAX_SPEED;
	}
	if (speed > recMaxSpeed) {
		thrust =
			MIN_THRUST +
			Math.ceil((recMaxSpeed / MAX_SPEED) * (100 - MIN_THRUST));
	}

	if (!isWithin(nextAngle, 90)) {
		thrust = MIN_THRUST;
	}
	// else if (!(nextAngle === 0) && (nextDist < 300)) {
	//     thrust = Math.ceil(25 + (75 - (90/Math.abs(nextAngle))))
	//     console.error("Angle: " + nextAngle);
	// } else if (!nextAngle === 0) {
	//     thrust = Math.ceil(50 + (50 - (90/Math.abs(nextAngle))))
	//     console.error("Angle: " + nextAngle);
	// }

	if (distanceToEdge > 5000 && boostLeft > 0 && isWithin(nextAngle, 2)) {
		thrust = BOOST;
		boostLeft--;
	}

	targetLoc = driftCompensate(checkPointLoc, loc, lastLoc);

	const consoleThrust = thrust === -1 ? 'BOOST' : thrust;
	console.log(targetLoc.x + ' ' + targetLoc.y + ' ' + consoleThrust);

	// Implement way to target perim - 100, not center?
	// Calculate velocity, compensate for it
	lastLoc = { x: x, y: y };
	lastCheckPointLoc = { x: nextX, y: nextY };
	loop++;

	console.error('Speed:       ' + speed);
	console.error('RecMaxSpeed: ' + recMaxSpeed);
	console.error('Thrust:      ' + thrust);
	console.error('Angle:       ' + nextAngle);
	console.error('DriftAngle:       ' + driftAngle);
}
