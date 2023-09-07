const ghpages = require('gh-pages');
const config = require('../foundryvtt.config');

const repo = config.githubRepo;
const branch = config.githubBranch;
const repository = `https://github.com/${repo}.git`;

if(repo !== undefined && branch !== undefined) {
    const options = {
        branch: branch,
        repo: repository,
        tag: config.version,
    }
    console.warn(options);
    ghpages.publish('dist', options);
}