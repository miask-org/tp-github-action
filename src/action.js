const core = require('@actions/core');
const github = require('@actions/github');
const cp = require('child_process');
const util = require('util');
const fs = require('fs');
const exec = util.promisify(cp.exec);
var parser = require('xml2json');

async function main(){
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
  
    const octokit = github.getOctokit(GITHUB_TOKEN);
    const { context = {} } = github;

    core.setOutput('issue_number', '1');

    fs.readFile( './pom.xml', function(err, data) {
        var json = parser.toJson(data);
        console.log("to json ->", json);
     });
}

main();