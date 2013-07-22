(function(exports){

    // your code goes here

	exports.CONSTANTS = {
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
				DEFENSE: 1,
				ATTACK: 1
			},
			t: {
				NAME: 'forest',
				MOVES: 2,
				DEFENSE: 2,
				ATTACK: 1
			},
			h: {
				NAME: 'hills',
				MOVES: 2,
				DEFENSE: 2,
				ATTACK: 2
			},
			w: {
				NAME: 'swamp',
				MOVES: 4,
				DEFENSE: 1,
				ATTACK: 1
			},
			m: {
				NAME: 'mountains',
				MOVES: 4,
				DEFENSE: 3,
				ATTACK: 2
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
