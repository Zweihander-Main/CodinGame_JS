const config = {};
config.generate = () => {
	[config.MAP_WIDTH, config.MAP_HEIGHT] = readline()
		.split(' ')
		.map((a) => {
			return parseInt(a, 10);
		});
};

config.NONE = -1;
config.ROBOT_ALLY = 0;
config.ROBOT_ENEMY = 1;
config.HOLE = 1;
config.RADAR = 2;
config.TRAP = 3;
config.ORE = 4;

config.ADJACENCY = [
	{ x: -1, y: 0 },
	{ x: 1, y: 0 },
	{ x: 0, y: -1 },
	{ x: 0, y: 1 },
];
config.AGENTS_MOVE_DISTANCE = 4;
config.AGENTS_PER_PLAYER = 5;
config.AGENT_INTERACT_RADIUS = 1;
config.AGENT_RESPAWN_TIME = 999;
config.MAP_CLUSTER_SIZE = 5;
config.MAP_ORE_COEFF_X = 0.55;
config.MAP_HEIGHT = 15;
config.MAP_WIDTH = 30;
config.MAP_CLUSTER_DISTRIBUTION_MAX = 0.064;
config.MAP_CLUSTER_DISTRIBUTION_MIN = 0.032;
config.MAP_ORE_IN_CELL_MAX = 3;
config.MAP_ORE_IN_CELL_MIN = 1;
config.RADAR_COOLDOWN = 5;
config.RADAR_RANGE = 4;
config.ROBOTS_CAN_OCCUPY_SAME_CELL = true;
config.TRAP_CHAIN_REACTION = true;
config.TRAP_FRIENDLY_FIRE = true;
config.TRAP_COOLDOWN = 5;
config.TRAP_RANGE = 1;
config.EUCLIDEAN_RADAR = false;
config.AGENTS_START_PACKED = true;

// tuning
config.UNKNOWN_CELL_THRESHOLD = 100; // for radar
config.ENABLE_TRAPS = true;
// prettier-ignore
config.PROB_ORE = [0,0,0,1,1,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8,8,9,9,8,6,4,2,0,0,1,2,3,4,6,7,8,9,10,11,12,13,14,14,15,16,17,17,18,19,19,20,21,21,19,15,8,4,0,0,1,3,6,10,12,15,18,20,22,24,26,28,30,32,33,35,36,38,39,41,42,43,45,47,43,36,15,6,0,0,2,4,8,12,16,19,22,25,28,30,33,35,37,39,41,43,45,47,49,50,52,54,55,58,53,44,19,8,0,0,2,5,9,14,18,22,25,28,31,34,37,40,42,44,47,49,51,53,55,57,59,60,62,65,59,48,23,10,0,0,2,5,9,14,18,21,25,28,31,34,37,39,42,44,46,48,50,52,54,56,58,60,62,64,58,48,22,9,0,0,2,5,9,14,18,22,25,28,31,34,37,39,42,44,46,48,50,52,54,56,58,59,61,64,58,48,22,9,0,1,2,5,9,14,18,22,25,28,31,34,37,39,41,44,46,48,50,52,54,56,58,59,61,64,58,48,22,9,0,0,2,5,9,14,18,22,25,28,31,34,37,39,41,44,46,48,50,52,54,56,58,59,61,64,58,48,22,9,0,0,2,5,9,14,18,21,25,28,31,34,37,39,42,44,46,48,50,52,54,56,58,60,61,64,58,48,22,9,0,0,2,5,9,14,18,22,25,28,31,34,37,40,42,44,47,49,51,53,55,57,59,60,62,65,59,48,23,10,0,0,2,4,8,12,16,19,22,25,28,30,32,35,37,39,41,43,45,47,49,50,52,54,55,58,52,43,19,8,0,0,1,3,6,9,12,15,18,20,22,24,26,28,30,32,33,35,36,38,39,41,42,43,45,47,43,36,15,6,0,0,1,2,3,4,6,7,8,9,10,11,12,13,14,14,15,16,17,17,18,19,19,20,21,22,19,15,8,4,0,0,0,1,1,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8,8,9,9,8,6,4,2];
// prettier-ignore
config.OPTIMIZED_DIAMOND = [{x:-4,y:0},{x:-3,y:-1},{x:-3,y:0},{x:-3,y:1},{x:-2,y:-2},{x:-2,y:-1},{x:-2,y:0},{x:-2,y:1},{x:-2,y:2},{x:-1,y:-3},{x:-1,y:-2},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:-1,y:2},{x:-1,y:3},{x:0,y:-4},{x:0,y:-3},{x:0,y:-2},{x:0,y:-1},{x:0,y:1},{x:0,y:2},{x:0,y:3},{x:0,y:4},{x:1,y:-3},{x:1,y:-2},{x:1,y:-1},{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:1,y:3},{x:2,y:-2},{x:2,y:-1},{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:3,y:-1},{x:3,y:0},{x:3,y:1},{x:4,y:0},];

export default config;
