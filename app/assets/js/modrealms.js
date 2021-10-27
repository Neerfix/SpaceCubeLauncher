/**
 * ModRealms
 *
 * This module serves as a minimal wrapper for ModRealms's REST api.
 *
 * @module modrealms
 */
// Requirements
const request                               = require('request')
const logger                                = require('./loggerutil')('%c[ModRealms RestAPI]', 'color: #a02d2a; font-weight: bold')

const restUrl = 'https://api.modrealms.net'

let modpacks = []

exports.status = async function(){
    const newStatuses = []
    for(let i=0; i<modpacks.length; i++){
        newStatuses.push(await exports.getServerStatus(modpacks[i]))
    }

    return new Promise((resolve, reject) => {
        resolve(newStatuses)
    })
}

exports.getServerStatus = async function (modpack) {
    return new Promise((resolve, reject) => {
        let players = 0
        let name = modpack.name
        let status = 'GREY'

        request.get(restUrl + '/gameshards/' + modpack.id,
            {
                json: true,
                timeout: 2500
            },
            function(error, response, body){
                if(!body || error || response.statusCode !== 200){
                    logger.warn('Unable to retrieve gameshards!')
                    logger.error(error)
                    reject(error)
                } else {
                    const gameshards = body

                    for(let gameshard of gameshards){
                        players+=gameshard.playersOnline
                    }


                    status = gameshards.length === 0 ? 'YELLOW' : 'GREEN'
                    resolve(new Status(name, status, players, (60*gameshards.length)))
                }
            })
    })
}

exports.modpacks = async function(){
    const newModpacks = []
    return new Promise((resolve, reject) => {
        request.get(restUrl + '/modpacks',
            {
                json: true,
                timeout: 2500
            },
            function(error, response, body){
                if(error || response.statusCode !== 200){
                    logger.warn('Unable to retrieve access api')
                    logger.debug(error)
                    reject(error)
                } else {
                    const modpackList = body
                    for(let modpack of modpackList){
                        newModpacks.push(new Modpack(modpack._id, modpack.tag, modpack.name, modpack.version, modpack.description, modpack.image))
                    }
                    modpacks = newModpacks
                    resolve(newModpacks)
                }
            })
    })
}

class Status {

    constructor(name, status, players, maxPlayers) {
        this.name = name
        this.status = status
        this.players = players
        this.maxPlayers = maxPlayers
    }

    getName(){
        return this.name
    }

    getStatus(){
        return this.status
    }

    getPlayers(){
        return this.players
    }

    getMaxPlayers(){
        return this.maxPlayers
    }

    setName(name){
        this.name = name
    }

    setStatus(status){
        this.status = status
    }

    setPlayers(players){
        this.players = players
    }

    isOffline(){
        return this.status.toLowerCase() === 'red' || this.status.toLowerCase() === 'gray' || this.status.toLowerCase() === 'yellow'
    }
}

class Modpack {

    constructor(id, tag, name, version, description, image) {
        this.id = id
        this.tag = tag
        this.name = name
        this.version = version
        this.description = description
        this.image = image
    }

    static getId(){
        return this.id
    }

    static getTag(){
        return this.tag
    }

    static getName(){
        return this.name
    }

    static getVersion(){
        return this.version
    }

    static getDescription(){
        return this.description
    }

    static getImage(){
        return this.image
    }
}
