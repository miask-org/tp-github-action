const core = require('@actions/core');
const github = require('@actions/github');
const cp = require('child_process');
const util = require('util');
const exec = util.promisify(cp.exec);
const parser = require('xml2js');
const fs = require('fs');

async function main(){
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
  
    const octokit = github.getOctokit(GITHUB_TOKEN);
    const { context = {} } = github;

    let xml_data = fs.readFileSync("./pom.xml", "utf8");

    try {
    const pom = await parser.parseStringPromise(xml_data);
    core.setOutput("release_number", console.log(pom.project.version));
    }
    catch(error){
        console.error(error);
    } 
}

main();