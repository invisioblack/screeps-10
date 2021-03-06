/**
 * Created by Bob on 7/12/2017.
 */

let _ = require('lodash');
const profiler = require('screeps-profiler');

/**
 * @return {null}
 */
function role(creep) {
    if (creep.renewalCheck(6)) return creep.shibMove(creep.pos.findClosestByRange(FIND_MY_SPAWNS));
    //INITIAL CHECKS
    if (creep.borderCheck()) return null;
    if (creep.wrongRoom()) return null;
    let mineralHarvester = _.filter(Game.creeps, (c) => c.memory.role === 'mineralHarvester' && c.memory.assignedRoom === creep.room.name);
    if (mineralHarvester.length === 0 && creep.memory.assignedMineral && Game.getObjectById(creep.memory.assignedMineral).mineralAmount < 100) creep.memory.role = 'pawn';
    if (_.sum(creep.carry) === 0) {
        creep.memory.hauling = false;
    }
    if (_.sum(creep.carry) > creep.carryCapacity / 2) {
        creep.memory.hauling = true;
    }
    if (creep.memory.hauling === false) {
        if (creep.memory.mineralDestination) {
            let mineralContainer = Game.getObjectById(creep.memory.mineralDestination);
            if (mineralContainer) {
                if (mineralContainer.pos.getRangeTo(Game.getObjectById(creep.memory.assignedMineral)) < 5) {
                    let mineral = creep.pos.findClosestByRange(FIND_MINERALS);
                    if (_.sum(mineralContainer.store) > 0) {
                        for (const resourceType in mineralContainer.store) {
                            if (creep.withdraw(mineralContainer, resourceType) === ERR_NOT_IN_RANGE) {
                                creep.shibMove(mineralContainer);
                            }
                        }
                    } else if (mineral.mineralAmount === 0) {
                        creep.memory.role = 'pawn';
                    } else {
                        creep.idleFor(15);
                    }
                }
            }
        } else {
            if (creep.memory.assignedMineral) {
                let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] === 0});
                if (container && container.id) {
                    if (container.pos.getRangeTo(Game.getObjectById(creep.memory.assignedMineral)) < 5) {
                        creep.shibMove(container);
                        creep.memory.mineralDestination = container.id;
                    } else {
                        creep.shibMove(Game.getObjectById(creep.memory.assignedMineral))
                    }
                } else {
                    creep.shibMove(Game.getObjectById(creep.memory.assignedMineral))
                }
            } else {
                creep.memory.assignedMineral = creep.pos.findClosestByRange(FIND_MINERALS).id;
            }
        }

    } else {
        if (!creep.memory.terminalID) {
            let terminal = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_TERMINAL});
            if (terminal) {
                creep.memory.terminalID = terminal.id;
            }
        }
        if (creep.memory.terminalID) {
            let terminal = Game.getObjectById(creep.memory.terminalID);
            if (terminal) {
                if (_.sum(terminal.store) !== terminal.storeCapacity) {
                    for (const resourceType in creep.carry) {
                        if (creep.transfer(terminal, resourceType) === ERR_NOT_IN_RANGE) {
                            creep.shibMove(terminal);
                        }
                    }
                }
            }
        }
    }
}
module.exports.role = profiler.registerFN(role, 'mineralHaulerRole');
