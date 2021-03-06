/**
 * Created by Bob on 6/6/2017.
 */

const profiler = require('screeps-profiler');

function linkControl() {
    for (let link of _.values(Game.structures)) {
        if (link.structureType === STRUCTURE_LINK && link.id !== link.room.memory.controllerLink && link.id !== link.room.memory.storageLink) {
            if (link.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.structureType === STRUCTURE_STORAGE}).length > 0) {
                link.room.memory.storageLink = link.id;
                continue;
            }
            if (link.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => s.structureType === STRUCTURE_CONTROLLER}).length > 0) {
                link.room.memory.controllerLink = link.id;
                continue;
            }
            if (Game.getObjectById(link.room.memory.storageLink) || Game.getObjectById(link.room.memory.controllerLink)) {
                let storageLink = Game.getObjectById(link.room.memory.storageLink);
                if (!storageLink) link.room.memory.storageLink = undefined;
                let controllerLink = Game.getObjectById(link.room.memory.controllerLink);
                if (!controllerLink) link.room.memory.storageLink = undefined;
                if (storageLink && storageLink.energy < 700 && (controllerLink && controllerLink.energy > 250)) {
                    link.transferEnergy(storageLink);
                } else if (controllerLink && controllerLink.energy < 250) {
                    link.transferEnergy(controllerLink);
                } else if (storageLink && storageLink.energy < 700) {
                    link.transferEnergy(storageLink);
                } else if (controllerLink && controllerLink.energy < 700) {
                    link.transferEnergy(controllerLink);
                }
            }
        }
    }
}
module.exports.linkControl = profiler.registerFN(linkControl, 'linkControl');