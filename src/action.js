const core = require('@actions/core');
const github = require('@actions/github');
const exe = require('@actions/exec');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

async function releaseExists(octokit, context, tag_name) {

    if (tag_name != null || tag_name != '') {

        try {
            await octokit.repos.getReleaseByTag({
                //Params
                ...context.repo,
                tag: tag_name,
            });

            console.log('Release already exists.');

        } catch(error) {

            if (error.status == 404 ) {
                console.log('Release not found.');
                return false;
            } else {
                console.log('Error while fetching release. Error: ', error);
            }
        }
    }
    return true;
}

async function buildPackage() {

    try {
        const build = await exec('mvn -B package --file pom.xml');
        console.log('build log', build.stdout)
        return true;
    }
    catch(error) {

        console.log('error log: ', error.stderr);
        return false;
    }
}

async function createRelease(octokit, context, tag_name, draft, prerelease) {

    try {

        const response = await octokit.repos.createRelease({
            //Params
            ...context.repo,
            tag_name: tag_name,
            name: tag_name,
            draft: draft,
            prerelease: prerelease
        });

        console.log('Release created.');
        return response.data;
    }
    catch(error) {

        console.log('Release failed');
        return null;
    }
}

async function getArtifactName() {

    try {
        var artifactName = await exec('cd target/ && ls *.jar | head -1');
        artifactName = artifactName.stdout.replace(/\r?\n|\r/g, "");
        console.log('artifact name: ', artifactName)
        return artifactName;
    }
    catch (error) {

        console.log('error log: ', error.stderr);
        return null;
    }
}

async function uploadReleaseAsset(octokit, context, release, artifactName) {

    try{
        const upload = await octokit.repos.uploadReleaseAsset({
            //Params
            ...context.repo,
            release_id: release.id,
            origin: release.upload_url,
            name: artifactName,
            data: fs.readFileSync('target/' + artifactName)
        });

        console.log('Release upload response')
        return true;
    }
    catch(error) {

        console.log('Release upload error: ', error);
        return false;
    }
}

async function uploadJarToAnypoint(client_id, client_secret, env, app, artifact) {

    try {
        const cmd = "anypoint-cli --username=" + client_id + " --password=" + client_secret + " --environment=" + env + " runtime-mgr cloudhub-application modify " + app + " target/" + artifact;
        const exe = await exec(cmd);
        console.log('Upload jar log: ', exe);
        return true;
    }
    catch(error) {

        console.log('Upload jar error: ', error);
        return false;
    }
}

function parseJSON(string) {

    try {

        var json = JSON.parse(string);
        return json;

    }
    catch (error) {

        console.error("Invalid Input for 'apps_data'.")
        return null;
    }
}

async function run(){

        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        const tag_name = core.getInput('tag_name');
        //const app_name = core.getInput('app_name');
        const client_id = core.getInput('client_id');
        const client_secret = core.getInput('client_secret');
        //const env = core.getInput('env');
        const json_apps_data = parseJSON(core.getInput('apps_data'));

        if(!json_apps_data){
            return;
        }

        const octokit = github.getOctokit(GITHUB_TOKEN);
        const { context = {} } = github;
        const { pull_request, repository } = context.payload;
            
        const isReleaseExists = await releaseExists(octokit, context, tag_name );

        if (!isReleaseExists) {

            const buildCompleted = await buildPackage();

            if (buildCompleted) {

                const release = await createRelease(octokit, context, tag_name, false, true)

                if (release) {

                    const artifactName = await getArtifactName();

                    if (artifactName) {

                        const uploadAssetResp = await uploadReleaseAsset(octokit, context, release, artifactName);

                        if (uploadAssetResp) {                      

                            json_apps_data.forEach(app => {
                                
                                uploadJarToAnypoint(client_id, client_secret, app.env, app.name, artifactName);
                            });

                            
                        }
                    }
                }
            }
        }

    console.log("Action end");
}

run();

