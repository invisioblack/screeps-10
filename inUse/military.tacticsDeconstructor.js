/**
 * Created by rober on 7/3/2017.
 */
const profiler = require('screeps-profiler');

tacticSiege = function () {
    if (this.room.controller && this.room.controller.owner && _.includes(RawMemory.segments[2], this.room.controller.owner['username']) === false && this.room.controller.safeMode) {
        this.memory.attackStarted = 'safe';
        Memory.warControl[this.memory.attackTarget] = undefined;
        Memory.militaryNeeds[this.memory.attackTarget] = undefined;
        this.shibMove(new RoomPosition(25, 25, this.memory.staging), {range: 15});
    }
    if (this.hits === this.hitsMax) {
        this.memory.healing = undefined;
    }
    let squadLeader;
    if (!this.memory.assignedSquadLeader || !Game.getObjectById(this.memory.assignedSquadLeader)) {
        let leaders = _.filter(Game.creeps, (h) => h.memory.attackTarget === this.memory.attackTarget && h.memory.squadLeader === true);
        if (leaders.length > 0) this.memory.assignedSquadLeader = leaders[0].id;
    }
    if (this.memory.assignedSquadLeader) {
        squadLeader = Game.getObjectById(this.memory.assignedSquadLeader);
    }
    let armedHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: (e) => (e.getActiveBodyparts(ATTACK) >= 1 || e.getActiveBodyparts(RANGED_ATTACK) >= 1) && _.includes(RawMemory.segments[2], e.owner['username']) === false});
    if (this.pos.getRangeTo(armedHostile) <= 3) {
        return this.retreat(8);
    }
    if (this.hits < this.hitsMax) {
        this.heal(this);
    }
    //Check if safe mode
    if (this.room.controller && this.room.controller.owner && _.includes(RawMemory.segments[2], this.room.controller.owner['username']) === false && this.room.controller.safeMode) {
        this.memory.attackStarted = 'safe';
        Memory.warControl[this.memory.attackTarget] = undefined;
        Memory.militaryNeeds[this.memory.attackTarget] = undefined;
        this.shibMove(new RoomPosition(25, 25, this.memory.staging), {range: 15});
    }
    if (!this.memory.attackTarget) {
        this.shibMove(new RoomPosition(25, 25, this.memory.staging), {range: 15});
        this.memory.attackTarget = 'available';
    }
    if ((this.memory.attackTarget && this.pos.roomName === this.memory.attackTarget) || this.memory.healing === true || (this.memory.siegeStarted === true && this.pos.roomName === this.memory.attackTarget)) {
        if (this.pos.getRangeTo(armedHostile) <= 2) {
            this.retreat(8);
        } else {
            this.say('HI! :D', true);
            return this.siege();
        }
    } else if ((!squadLeader || squadLeader.memory.attackStarted !== true) && this.memory.attackType !== 'decon' && this.memory.attackType !== 'clean') {
        this.memory.siege = undefined;
        this.memory.fallBackRoom = this.pos.roomName;
        this.shibMove(new RoomPosition(25, 25, this.memory.staging), {range: 15});
    } else if (this.memory.siegeStarted !== true) {
        this.memory.siege = undefined;
        this.memory.fallBackRoom = this.pos.roomName;
        if (this.pos.getRangeTo(new RoomPosition(25, 25, this.memory.attackTarget)) > 30) {
            this.shibMove(new RoomPosition(25, 25, this.memory.attackTarget), {range: 23});
        } else {
            this.memory.siegeStarted = true;
        }
    } else {
        this.memory.siege = undefined;
        this.memory.fallBackRoom = this.pos.roomName;
        this.shibMove(new RoomPosition(25, 25, this.memory.attackTarget), {range: 23, repathChance: 0.5, ignoreCreeps: false});
    }
};
Creep.prototype.tacticSiege = profiler.registerFN(tacticSiege, 'tacticSiegeTactic');