
const core = require('@actions/core');
const github = require('@actions/github');
const exe = require('@actions/exec');
const { exec } = require('child_process');
const fs = require('fs');

async function run(){

        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        const tag_name = core.getInput('tag_name');

        const octokit = github.getOctokit(GITHUB_TOKEN);
        const { context = {} } = github;
        const { pull_request, repository } = context.payload;

        if (tag_name != null || tag_name != '') {

            try {
                const response = await octokit.repos.getReleaseByTag({
                    //Params
                    ...context.repo,
                    tag: tag_name,
                });

                console.log('release response: ', response);
                
            } catch(err) {
                console.log('release error: ', err);
                return;
            }
        }
            
            /*.then( (success) => {
                
                if (success.status == 200) {
                    console.log("Release already exists.");
                    return;
                }

            }, (failure) => {
                

                console.log("Building the project..."); 

                exec('mvn -B package --file pom.xml', (error, stdout, stderr) => {

                    if (error) {
                        console.error(`exec error: ${error}`);
                        //exec('exit 1');
                        return;
                    }

                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    console.log("creating new release...");

                    octokit.repos.createRelease({
                        //Params
                        ...context.repo,
                        tag_name: tag_name,
                        name: tag_name,
                        draft: false,
                        prerelease: true

                    }).then( (success) => {

                        console.log("Release created.");


                        exec('cd target/ && ls *.jar | head -1', (error, stdout, stderr) => {

                            if (error) {
                                console.error(`exec error: ${error}`);
                                //exec('exit 1');
                                return;
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);
                            artifactName = stdout;

                            octokit.repos.uploadReleaseAsset({
                                //Params
                                ...context.repo,
                                release_id: success.data.id,
                                origin: success.data.upload_url,
                                name: artifactName,
                                data: fs.readFileSync('target/${artifactName}')
                            });
                        });

                    }, (failure) => {

                        console.log("Release failed. ");
                        return;
                    });
                });

            });
         
            //- name: GEt jar file in an env variable.
            //run: echo "artifactName=$(cd target/ && ls *.jar | head -1)"  >> $GITHUB_ENV
        }
*/
    console.log("Action end");
}

run();
