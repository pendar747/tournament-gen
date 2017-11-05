const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const parseCSVSync = require('csv-parse/lib/sync');

const {
    POOL_PARTICIPANTS,
    FOOZBALL_DOUBLES_PARTICIPANTS,
    FOOZBALL_SINGLES_PARTICIPANTS,
    PARTICIPANTS_DIR,
    MATCHES_DIR,
    GROUPS_DIR,
    POINT_PER_WIN
} = require('./config');

const readGroups = (dirPath) => {
    const groupFiles = fs.readdirSync(dirPath);
    return groupFiles.map(filename => {
        const filePath = path.join(dirPath, filename);
        const raw = fs.readFileSync(filePath, {encoding: 'utf8'});
        const csv = parseCSVSync(raw);
        return csv.map(([name, email]) => ({ name, email }));
    });
}

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
        return {
            side1: {
                name: name1,
                email: email1,
                pocketed: numPocketed1
            },
            side2: {
                name: name2,
                email: email2,
                pocketed: numPocketed2
            },
            winner
        }
    }
    return groupFiles.map(filename => {
        const filePath = path.join(dirPath, filename);
        const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
        const flat = parseCSVSync(raw);
        return flat.slice(0).map(mapCSVArray);
    });
}

const rankAndGroup = (groups, allMatches) => {
    if (groups.length !== allMatches.length) {
        console.error('Data is corrupted!');
    }
    return groups.map((group, i) => {
        const matches = allMatches[i];
        const getPoints = (name) => matches.reduce((points, match) => {
            points += match.winner == name ? POINT_PER_WIN : 0;
            return points;
        }, 0);
        const getPocketed = (name) => matches.reduce((pocketed, match) => {
            if (match.side1.name == name) {
                pocketed += parseInt(match.side1.pocketed);
            } else if (match.side2.name == name) {
                pocketed += parseInt(match.side2.pocketed);
            }
            return pocketed;
        }, 0);
        const addData = ({ name, email }) => {
            const points = getPoints(name);
            const pocketed = getPocketed(name);
            return {
                points,
                email,
                name,
                pocketed
            }
        };
        const rank = (person1, person2) => {
            return person1.points !== person2.points 
                ? person2.points - person1.points
                : person2.pocketed - person1.pocketed;
        }
        return group.map(addData).sort(rank);
    });
}

updateGroups = () => {
    const matchesDir = path.join(MATCHES_DIR, 'pool');

    console.info('Reading matches from', matchesDir);

    const allMatches = readGroupMatches(matchesDir);

    console.log('All read matches are', allMatches);

    const groupsDir = path.join(GROUPS_DIR, 'pool');
    
    console.info('Reading groups from', groupsDir);

    const groups = readGroups(groupsDir);

    console.info('Read groups are', groups);

    const rankedGroups = rankAndGroup(groups, allMatches);

    console.info('rankedGroups', rankedGroups);
}

module.exports = updateGroups;
