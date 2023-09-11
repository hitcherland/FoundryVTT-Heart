// this might not be needed as we currently load this all
// into one giant file. Might try not doing that and see how
// the load times are
const sass = require('sass');

const result = sass.compile(scssFilename);