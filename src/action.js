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

    try {
    const pom = parser.parseString(xml_string);
    core.setOutput("Release", pom.project.version);
    }
    catch(err){
        console.error(err);
    }
}

main();