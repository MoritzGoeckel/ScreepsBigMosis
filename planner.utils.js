var utils = require('./opts.utils');
var oneIn = require('./opts.rnd');

module.exports = {
    checkNearSpawns(room, type, maxNumStructureNearby, searchDistance){
        let spawns = room.find(FIND_STRUCTURES).filter(function(structure) {
            return structure.structureType == STRUCTURE_SPAWN;
        });
    
        for(let s in spawns){
            module.exports.checkConstruction(room, spawns[s].pos, type, maxNumStructureNearby, searchDistance);
        }
    },
    
    checkNearSources(room, type, maxNumStructureNearby, searchDistance){
        let sources = room.find(FIND_SOURCES);
    
        for(let s in sources){
            module.exports.checkConstruction(room, sources[s].pos, type, maxNumStructureNearby, searchDistance);
        }
    },
    
    draw(room, poses){
        let i = 1;
        for(let p in poses){
            let pos = JSON.parse(poses[p][0])
            room.visual.circle(pos.x, pos.y, {fill: 'transparent', radius: 1.0/i++ * 0.3, stroke: 'red'});
        }
    },
    
    checkConstruction(room, pos, type, maxNumStructureNearby, searchDistance){
        let scored = module.exports.getSuitablePositionCloseTo(room, pos, type, maxNumStructureNearby, searchDistance);
        module.exports.draw(room, scored);
        if(scored.length != 0){
            module.exports.constructOneFromScored(room, 
                scored,
                type
            );
        }
    },

    getSuitablePositionCloseTo(room, targetPosition, structureType, maxNumStructureNearby, searchDistance){
        console.log("Expensive getSuitablePositionCloseTo " + structureType);
    
        let scored = {};
    
        let existingSites = targetPosition.findInRange(FIND_CONSTRUCTION_SITES, searchDistance).filter(function(site) {
            return site.structureType == structureType;
        }).length;
    
        let existingContainerClose = targetPosition.findInRange(FIND_STRUCTURES, searchDistance).filter(function(structure) {
            return structure.structureType == structureType;
        }).length;
    
        if(existingContainerClose >= maxNumStructureNearby || existingSites > 0)
            return [];
    
        if(room.memory.nobuild == undefined){
            console.log("Waiting for nobuild to be initialized");
            return [];
        }
        
        for(let x = -searchDistance / 2; x < searchDistance / 2; x++){
            for(let y = -searchDistance / 2; y < searchDistance / 2; y++){
                let candidate = new RoomPosition(targetPosition.x + x, targetPosition.y + y, room.name);
    
                if(room.memory.nobuild[JSON.stringify({x: candidate.x, y: candidate.y})] == undefined && 
                    utils.isWalkable(candidate) && utils.isWalkableAround(candidate)){
    
                    let distance = utils.distance(candidate, targetPosition);
                    if(distance < 2)
                        continue;

                    scored[JSON.stringify(candidate)] = 1 / distance;
                }
            }
        }
    
        console.log("Found " + Object.keys(scored).length + " for " + structureType);

        return  utils.dictToScoreSortedList(scored);
    },

    constructOneFromScored(room, poses, structureType){
        if(poses.length == 0){
            console.log("Cant construct: No suitable position");
            return;
        }
    
        let posParsed = JSON.parse(poses[0][0])
        let pos = new RoomPosition(posParsed.x, posParsed.y, room.name);
    
        //room.visual.circle(pos.x, pos.y, {fill: 'transparent', radius: 1.3, stroke: 'red'});
        let result = pos.createConstructionSite(structureType);
        if(result != 0){
            console.log("Cant construct: Error code = " + result + " for " + structureType);
        }
    },

    mayBuild(pos, room){
        return room.memory.nobuild[JSON.stringify({x: pos.x, y: pos.y})] == undefined;
    }
};