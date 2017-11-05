const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const parseCSVSync = require('csv-parse/lib/sync');

const gen = require('./gen');
const updateGroups = require('./update-groups');

const main = () => {

    const cliArgs = process.argv.slice(2);

    const usage = args => [
        `Unknown cli args ${args.join(' ')}`,
        'Usage:',
        '',
        '    npm run gen <tournament-type> <group-size=3> <min-size=1> # Generates the groups and matches for the given tournament type',
        '    npm run update-groups         # Updates all group scores by reading the group match csv files',
        ''
    ].join('\n'); 

    switch (cliArgs[0]) {
        case 'gen':
            gen(cliArgs.slice(1));
            break;
        case 'update-groups':
            updateGroups();
            break;
        default:
            console.info(usage(cliArgs));
            process.exit(1);
            break;
    }
};

main();
