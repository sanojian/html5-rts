(function(exports){

    // your code goes here

	exports.CONSTANTS = {
		TURN_TIME: 10000,
		SOLDIERS: {
			infantry: {
				ATTACK: 2,
				DEFENSE: 3,
				MOVES: 2,
				RANGE: 1
			},
			cavalry: {
				ATTACK: 2,
				DEFENSE: 2,
				MOVES: 4,
				RANGE: 1
			},
			ranged: {
				ATTACK: 1,
				DEFENSE: 1,
				MOVES: 2,
				RANGE: 3
			}
		},
		TERRAIN: {
			g: {
				NAME: 'grass',
				MOVES: 1,
				MOUNTED: 1,
				DEFENSE: 1,
				ATTACK: 1
			},
			t: {
				NAME: 'forest',
				MOVES: 2,
				MOUNTED: 2,
				DEFENSE: 2,
				ATTACK: 1
			},
			h: {
				NAME: 'hills',
				MOVES: 2,
				MOUNTED: 2,
				DEFENSE: 2,
				ATTACK: 2
			},
			s: {
				NAME: 'swamp',
				MOVES: 2,
				MOUNTED: 4,
				DEFENSE: 1,
				ATTACK: 1
			},
			m: {
				NAME: 'mountains',
				MOVES: 2,
				MOUNTED: 4,
				DEFENSE: 3,
				ATTACK: 2
			},
			v: {
				NAME: 'village',
				MOVES: 1,
				MOUNTED: 1,
				DEFENSE: 2,
				ATTACK: 2
			},
			c: {
				NAME: 'castle',
				MOVES: 1,
				MOUNTED: 1,
				DEFENSE: 4,
				ATTACK: 4
			},
			'0': {
				NAME: 'ocean',
				MOVES: 99,
				DEFENSE: 1,
				ATTACK: 1
			}
		}
	};

})(typeof exports === 'undefined'? this['gameDefs']={}: exports);

