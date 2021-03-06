var utils = require('./opts.utils');
var guidelines = require('./guidelines');

function repair(tower){
    // Maybe not the closest, but the most damaged (least health points)
    
    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => 
           s.hits < s.hitsMax * guidelines.getLowerRepairThreshold(tower.room) 
        && utils.distance(s.pos, tower.pos) < 100 // Should also repair far structures
        && s.structureType != STRUCTURE_ROAD
        && (
               (s.structureType == STRUCTURE_WALL && s.hits < guidelines.getMaxWallHitpoints(tower.room) * guidelines.getLowerRepairThreshold(tower.room))
            || (s.structureType == STRUCTURE_RAMPART && s.hits < guidelines.getMaxRampartHitpoints(tower.room) * guidelines.getLowerRepairThreshold(tower.room))
            || (s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL)
           )
    });
    
    if(closestDamagedStructure) {
         tower.repair(closestDamagedStructure);
         return true;
    }
    else
        return false;
}

function heal(tower){
    // TODO: Healing
    /*for (let name in Game.creeps) {
        // get the creep object
        var creep = Game.creeps[name];
        if (creep.hits < creep.hitsMax) {
            towers.forEach(tower => tower.heal(creep));
            console.log("Tower is healing Creeps.");
        }
    }*/        
}

function defend(tower){
    var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (target != undefined) {
        tower.attack(target);
        return true;
    }
    else
        return false;
}

module.exports = {

    run: function(room){
        var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        for(let t in towers){
            let tower = towers[t];
            
            if(defend(tower))
                continue;
            
            if(tower.energy > tower.energyCapacity * 0.65 && repair(tower))
                continue;
            
            heal(tower);
        }
    }
};
