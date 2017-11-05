const path = require('path');

const POOL_PARTICIPANTS = './pool.csv';
const FOOZBALL_SINGLES_PARTICIPANTS = './foozball_singles.csv';
const FOOZBALL_DOUBLES_PARTICIPANTS = './foozball_doubles.csv';
const PARTICIPANTS_DIR = './input';
const OUTPUT_DIR = './output';
const POINT_PER_WIN = 3;

const MATCHES_DIR = path.join(OUTPUT_DIR, 'matches');
const GROUPS_DIR = path.join(OUTPUT_DIR, 'groups');

const RESULTS_TEMPLATE = './result.pug';
const TABLES_DIR = path.join(OUTPUT_DIR, 'tables');

module.exports = {
    POOL_PARTICIPANTS,
    FOOZBALL_DOUBLES_PARTICIPANTS,
    FOOZBALL_SINGLES_PARTICIPANTS,
    PARTICIPANTS_DIR,
    MATCHES_DIR,
    GROUPS_DIR,
    OUTPUT_DIR,
    POINT_PER_WIN,
    RESULTS_TEMPLATE,
    TABLES_DIR
};