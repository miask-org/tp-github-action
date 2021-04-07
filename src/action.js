
const core = require('@actions/core');
const github = require('@actions/github');
const exe = require('@actions/exec');
const { exec } = require('child_process');

async function run(){
    try{
        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        const tag_name = core.getInput('tag_name');

        const octokit = github.getOctokit(GITHUB_TOKEN);
        const artifactName = '';
        const { context = {} } = github;
        const { pull_request, repository } = context.payload;

        if (tag_name != null || tag_name != '') {

            octokit.repos.getReleaseByTag({
                //Params
                ...context.repo,
                 tag: tag_name,

            }).then( (success) => {
                
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

                        console.log("create release success: ", success);


                        exec('d target/ && ls *.jar | head -1', (error, stdout, stderr) => {

                            if (error) {
                                console.error(`exec error: ${error}`);
                                //exec('exit 1');
                                return;
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);
                            artifactName = stdout;

                        });

                    }, (failure) => {

                        console.log("create release failure: ",  failure);
                        return;
                    });
                });

            });
         
            //- name: GEt jar file in an env variable.
            //run: echo "artifactName=$(cd target/ && ls *.jar | head -1)"  >> $GITHUB_ENV
        }

    } catch (error) {

        console.log("catch error: ", error);
    }

    console.log("Action end");
}

run();
