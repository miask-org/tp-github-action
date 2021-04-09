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
        console.log("Building project...")
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
        var asset_name = await exec('cd target/ && ls *.jar | head -1');
        asset_name = asset_name.stdout.replace(/\r?\n|\r/g, "");
        console.log('artifact name: ', asset_name)
        return asset_name;
    }
    catch (error) {

        console.log('error log: ', error.stderr);
        return null;
    }
}

async function uploadReleaseAsset(octokit, context, release, asset_name) {

    try{
        const upload = await octokit.repos.uploadReleaseAsset({
            //Params
            ...context.repo,
            release_id: release.id,
            origin: release.upload_url,
            name: asset_name,
            data: fs.readFileSync('target/' + asset_name)
        });

        console.log('Release asset uploaded.');
        return true;
    }
    catch(error) {

        console.log('Release asset upload error: ', error);
        return false;
    }
}

async function uploadJarToAnypoint(client_id, client_secret, env, app, artifact) {

    try {
        const cmd = "anypoint-cli --username=" + client_id + " --password=" + client_secret + " --environment=" + env + " runtime-mgr cloudhub-application modify " + app + " target/" + artifact;
        const exe = await exec(cmd);
        console.log('Cloudhub application modified.');
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

        console.error("Invalid Input for deployment args. error: ", error);
        return null;
    }
}

async function run(){

        const github_token = core.getInput('github_token');
        const args = parseJSON(core.getInput('deployment_args'));

        if(!args){
            return;
        }

        const octokit = github.getOctokit(github_token);
        const { context = {} } = github;
        const { client_id, client_secret }  = args.cloudhub_creds;

        const is_release_exists = await releaseExists(octokit, context, args.release_tag);

        if (!is_release_exists) {

            const is_project_build = await buildPackage();

            if (is_project_build) {

                const release = await createRelease(octokit, context, args.release_tag, false, true)

                if (release) {

                    const artifact_name = await getArtifactName();

                    if (artifact_name) {

                        const asset = await uploadReleaseAsset(octokit, context, release, artifact_name);

                        if (asset) {                      

                            args.cloudhub_apps.forEach(app => {
                                
                                uploadJarToAnypoint(client_id, client_secret, app.env, app.name, artifact_name);
                            });

                            
                        }
                    }
                }
            }
        }

    console.log("Action end");
}

run();

