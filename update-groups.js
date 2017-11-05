const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const parseCSVSync = require('csv-parse/lib/sync');

const {
    POOL_PARTICIPANTS,
    foozball_doubles,
    foozball_singles,
    PARTICIPANTS_DIR,
    MATCHES_DIR
} = require('./config');

const readGroupMatches = (dirPath) => {
    const groupFiles = fs.readdirSync(dirPath);
    const mapCSVArray = ([
        name1, 
        email1, 
        name2, 
        email2, 
        winner, 
        numPocketed1, 
        numPocketed2
    ]) => {
        return [
            {
                name: name1,
                email: email1,
                winner: winner === name1,
                pocketed: numPocketed1
            },
            {
                name: name2,
                email: email2,
                winner: winner === name2,
                pocketed: numPocketed2
            }
        ]
    }
    return groupFiles.map(filename => {
        const filePath = path.join(dirPath, filename);
        const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
        console.log('raw is', raw);
        const flat = parseCSVSync(raw);
        return flat.slice(0).map(mapCSVArray);
    });
}

updateGroups = () => {
    const dirPath = path.join(MATCHES_DIR, 'pool');
    const groupMatches = readGroupMatches(dirPath);

    console.log('group matches are', groupMatches);
}

module.exports = updateGroups;
