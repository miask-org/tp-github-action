const core = require('@actions/core');
const github = require('@actions/github');
const cp = require('child_process');
const util = require('util');
const exec = util.promisify(cp.exec);
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

async function main(){
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
  
    const octokit = github.getOctokit(GITHUB_TOKEN);
    const { context = {} } = github;

    let xml_string = fs.readFileSync("./pom.xml", "utf8");

    const pom = parser.parseString(xml_string, function(error, result) {
        if(error === null) {
            console.log(result);
            core.setOutput('release_number', result.project.version);
        }
        else {
            console.log(error);
        }
    });
}

main();