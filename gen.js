const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const parseCSVSync = require('csv-parse/lib/sync');

const {
    POOL_PARTICIPANTS,
    FOOZBALL_DOUBLES_PARTICIPANTS,
    FOOZBALL_SINGLES_PARTICIPANTS,
    PARTICIPANTS_DIR,
    MATCHES_DIR
} = require('./config');

const removeIndex = (i, a) => a.slice(0, i).concat(a.slice(i + 1));

const readParticipants = (relative) => {
    const filePath = fs.readFileSync(
        path.resolve(relative)
    );
    return parseCSVSync(filePath).slice(1).map(([name, email]) => {
        return {
            name,
            email
        };
    });
};

const createGroups = (people, nominalSize, minSize = 2) => {
    const size = people.length;
    let lastGroupSize = size % nominalSize;
    let numGroups = Math.ceil(size / nominalSize);

    if (lastGroupSize <= minSize) {
        lastGroupSize = nominalSize + lastGroupSize;
        numGroups -= 1;
    }

    let leftPeople = people;
    
    const pullPersonAtRandom = () => {
        const random = _.random(0, leftPeople.length - 1);
        const person = leftPeople[random];
        _.pullAt(leftPeople, random);
        return person;
    }

    const makeGroup = (value, i) => {
        const groupSize = i == numGroups - 1 ? lastGroupSize : nominalSize;
        return new Array(groupSize).fill(0)
            .map(pullPersonAtRandom);
    }

    return new Array(numGroups).fill(0).map(makeGroup);
};

const getMaxNumberOfMatches = (groupSize) => {
    let num = 0;
    for (var i = 1; i < groupSize; i++) {
        num += i;
    }
    return num;
}

const makeMatches = (group) => {
    let groupClone = _.clone(group);
    let currentPerson;
    const makeMatchesForPerson = (person, i) => groupClone
        .map((otherPerson) => [person, otherPerson]);

    return groupClone.reduce((matches, person, i) => {
        groupClone = removeIndex(i, groupClone);
        return [...matches, ...makeMatchesForPerson(person, i)];
    }, []);
};

const makeMatchesForAll = (groups) => groups.map(group => makeMatches(group));

const groupMatchesToCSVArray = (matches) => {
    const body = matches.map(([person1, person2]) => {
        return [person1.name, person1.email, person2.name, person2.email, '', 0, 0];
    });
    const head = [
        'side 1 name', 
        'side 1 email', 
        'side 2 name', 
        'side 2 email',
        'winner',
        '# pocketed for player 1',
        '# pocketed for player 2',
    ];
    return [head, ...body];
}

const csvArrayToString = (matches) => {
    return matches
        .map(a => a.join(',')).join('\n');
}

const allMatchesToCSVString = allMatches => allMatches
    .map(groupMatches => csvArrayToString(groupMatchesToCSVArray(groupMatches)));

const gen = ([tournamentType = '', groupSize = 3, minSize = 1]) => {

    const fileMap = {
        'foozball_singles': FOOZBALL_SINGLES_PARTICIPANTS,
        'foozball_doubles': FOOZBALL_DOUBLES_PARTICIPANTS,
        'pool': POOL_PARTICIPANTS
    };

    const filePath = fileMap[tournamentType.toLowerCase()];

    if(!filePath) {
        console.error(
            'Please choose one of', Object.keys(fileMap), 'tournament types');
        process.exit(1);
    }

    const relative = path.join(PARTICIPANTS_DIR, filePath);
    const people = readParticipants(relative);

    if (!people.length) {
        console.error('No participants are recorded for ', tournamentType);
        console.error('Reading file', relative);
        process.exit(1);
    }

    console.log('People are', people);

    const groups = createGroups(people, groupSize, minSize);

    console.log('Groups are', groups);

    const matches = makeMatchesForAll(groups);

    const csvMatches = allMatchesToCSVString(matches);

    const basePath = path.join(MATCHES_DIR, tournamentType);

    if (!fs.existsSync(basePath)) {
        fs.mkdir(basePath);
    }

    csvMatches.forEach((groupStage, i) => {
        const filePath = path.join(basePath, `group_${i + 1}.csv`);
        fs.writeFileSync(filePath, groupStage);
        console.info('Group', i, 'matches written to', filePath);
    });
}

module.exports = gen;
