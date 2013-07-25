var port = process.env.PORT || 5000;

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });

var g_gameDefs = require('./client/game_defs');
var g_map = require('./client/map');

var g_players = {};
var g_Resets = 15;
var g_playerMap = {};
var g_nextId = 1;
var MODE_COMBAT = 0;
var MODE_MOVEMENT = 1;
var g_mode = MODE_COMBAT;

server.listen(port);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

function initNewPlayer(id, name) {
	var startX = (g_Resets * 3 + 3) > (g_map.MAP.length - 2) ? g_map.MAP[0].length - 7 : 4;
	var startY = (g_Resets * 3 + 3) % (g_map.MAP.length - 2) ;
	
	g_players[id] = { 
		playerId: id,
		name: name,
		soldiers: [
			{ id: 0, playerId: id, type: 'cavalry', xp: 0, str: 8, x: startX, y: startY },
			{ id: 1, playerId: id, type: 'ranged', xp: 0, str: 8, x: startX+1, y: startY },
			{ id: 2, playerId: id, type: 'infantry', xp: 0, str: 8, x: startX+1, y: startY+1 },
			{ id: 3, playerId: id, type: 'infantry', xp: 0, str: 8, x: startX+2, y: startY+1 },
			{ id: 4, playerId: id, type: 'infantry', xp: 0, str: 8, x: startX+3, y: startY+1 },
			{ id: 5, playerId: id, type: 'ranged', xp: 0, str: 8, x: startX+2, y: startY },
			{ id: 6, playerId: id, type: 'cavalry', xp: 0, str: 8, x: startX+3, y: startY }
		]
	};
	g_Resets = (g_Resets + 1) % (Math.floor(g_map.MAP.length/3 - 1) * 2);
}

io.sockets.on('connection', function (socket) {
	var id = -1;

	socket.on('GIVE_NAME', function(data) {
		if (!g_playerMap[data.name]) {
			// new player
			id = g_nextId++;
			g_playerMap[data.name] = { id: id, pass: data.pass };
			initNewPlayer(id, data.name);
		}
		else if (data.pass != g_playerMap[data.name].pass) {
			// user exists, but wrong password
			socket.emit('WRONG_PASS', false);
			return;
		}
		else {
			id = g_playerMap[data.name].id;
			var hasSoldiers = false;
			for (var i=0;i<g_players[id].soldiers.length;i++) {
				if (g_players[id].soldiers[i]) {
					hasSoldiers = true;
				}
			}
			if (!hasSoldiers) {
				// no more soliders, re-init
				initNewPlayer(id, data);
			}
		}
		
		// give player their id
		socket.emit('GET_ID', { playerId: id });
	
		// notify other players
		io.sockets.emit('PRESENSE', { player: g_players[id], present: true });

	});
	
	// init message handlers
	socket.on('GET_ENTITIES', function (data) {
		socket.emit('ENTITY_LIST', g_players);
	});

	socket.on('MOVE', function (data) {
		if (g_mode == MODE_COMBAT) {
			return;
		}
		data.playerId = id;
		g_players[id].soldiers[data.id].x = data.x;
		g_players[id].soldiers[data.id].y = data.y;
		io.sockets.emit('MOVE', data);
	});
	
	socket.on('disconnect', function () {
		io.sockets.emit('PRESENSE', { playerId: id, present: false });
	});
	
});

var findBad = function(playerId, units, nearBads, x, y, range) {

	if (units[y] && units[y][x] && units[y][x].playerId != playerId) {
		nearBads.push(units[y][x]);
	}
	if (range > 0) {
		findBad(playerId, units, nearBads, x - (y%2 ? 0 : 1),y-1, range-1);
		findBad(playerId, units, nearBads, x + (y%2 ? 1 : 0), y-1, range-1);
		findBad(playerId, units, nearBads, x - 1, y, range-1);
		findBad(playerId, units, nearBads, x + 1, y, range-1);
		findBad(playerId, units, nearBads, x - (y%2 ? 0 : 1), y+1, range-1);
		findBad(playerId, units, nearBads, x + (y%2 ? 1 : 0), y+1, range-1);
	}
	
};

var unitAttack = function(unit, bad) {
	var damage = 0.3 * Math.random() * unit.str * g_gameDefs.CONSTANTS.SOLDIERS[unit.type].ATTACK;
	var terrain = g_map.MAP[bad.y].charAt(bad.x);
	var defense = 0.1 * Math.random() * (g_gameDefs.CONSTANTS.SOLDIERS[bad.type].DEFENSE + g_gameDefs.CONSTANTS.TERRAIN[terrain].DEFENSE);
	
	return Math.max(0, Math.floor(damage - defense));

};

var doGameLoop = function() {
	g_mode = g_mode == MODE_COMBAT ? MODE_MOVEMENT : MODE_COMBAT;
	io.sockets.emit('MODE', g_mode);

	if (g_mode == MODE_COMBAT) {
		// build unit location array
		var units = [];
		for (var playerId in g_players) {
			for (var i=0;i<g_players[playerId].soldiers.length;i++) {
				var unit = g_players[playerId].soldiers[i];
				if (unit) {
					units[unit.y] = units[unit.y] ? units[unit.y] : [];
					units[unit.y][unit.x] = unit;
				}
			}
		}
		// find adjacent enemies
		for (var playerId in g_players) {
			for (var i=0;i<g_players[playerId].soldiers.length;i++) {
				var nearBads = [];
				var unit = g_players[playerId].soldiers[i];
				
				if (unit && unit.type != 'ranged') { 
					findBad(playerId, units, nearBads, unit.x - (unit.y%2 ? 0 : 1), unit.y-1, 0);
					findBad(playerId, units, nearBads, unit.x + (unit.y%2 ? 1 : 0), unit.y-1, 0);
					findBad(playerId, units, nearBads, unit.x - 1, unit.y, 0);
					findBad(playerId, units, nearBads, unit.x + 1, unit.y, 0);
					findBad(playerId, units, nearBads, unit.x - (unit.y%2 ? 0 : 1), unit.y+1, 0);
					findBad(playerId, units, nearBads, unit.x + (unit.y%2 ? 1 : 0), unit.y+1, 0);
					if (nearBads.length) {
						// fight!
						var bad = nearBads[0];
						var badDmg = unitAttack(unit, bad);
						var unitDmg = unitAttack(bad, unit);
						unit.str = Math.max(0, unit.str - unitDmg);
						bad.str = Math.max(0, bad.str - badDmg);
						io.sockets.emit('UPDATE', unit);
						io.sockets.emit('UPDATE', bad);
						if (unit.str <=0) {
							g_players[unit.playerId].soldiers[unit.id] = undefined;
							units[unit.y][unit.x] = undefined;
						}
						if (bad.str <=0) {
							g_players[bad.playerId].soldiers[bad.id] = undefined;
							units[bad.y][bad.x] = undefined;
						}
					}
				}
			}
		}
		// now do ranged attack
		for (var playerId in g_players) {
			for (var i=0;i<g_players[playerId].soldiers.length;i++) {
				var nearBads = [];
				var unit = g_players[playerId].soldiers[i];
				
				if (unit && unit.type == 'ranged') {
					findBad(playerId, units, nearBads, unit.x - (unit.y%2 ? 0 : 1), unit.y-1, 1);
					findBad(playerId, units, nearBads, unit.x + (unit.y%2 ? 1 : 0), unit.y-1, 1);
					findBad(playerId, units, nearBads, unit.x - 1, unit.y, 1);
					findBad(playerId, units, nearBads, unit.x + 1, unit.y, 1);
					findBad(playerId, units, nearBads, unit.x - (unit.y%2 ? 0 : 1), unit.y+1, 1);
					findBad(playerId, units, nearBads, unit.x + (unit.y%2 ? 1 : 0), unit.y+1, 1);
					if (nearBads.length) {
						var bad = nearBads[0];
						var badDmg = unitAttack(unit, bad);
						bad.str = Math.max(0, bad.str - badDmg);
						io.sockets.emit('UPDATE', bad);
						if (bad.str <=0) {
							g_players[bad.playerId].soldiers[bad.id] = undefined;
							units[bad.y][bad.x] = undefined;
						}
					}
				}
			}
		}
		// heal units in cities
		for (var playerId in g_players) {
			for (var i=0;i<g_players[playerId].soldiers.length;i++) {
				var unit = g_players[playerId].soldiers[i];
				
				if (unit) {
					var terrain = g_map.MAP[unit.y].charAt(unit.x);
					if (terrain == 'v' || terrain == 'c') {
						// heal unit
						unit.str = Math.min(8, unit.str + (terrain == 'v' ? 1 : 1));
						io.sockets.emit('UPDATE', unit);
					}
				}
			}
		}				
		
	}

	
	setTimeout(doGameLoop, g_mode == MODE_COMBAT ? 1000 : 5000);
};
doGameLoop();