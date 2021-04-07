
const core = require('@actions/core');
const github = require('@actions/github');
const exe = require('@actions/exec');
const { exec } = require('child_process');

async function run(){
    try{
        /*const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        const tag_name = core.getInput('tag_name');

        const octokit = github.getOctokit(GITHUB_TOKEN);

        const { context = {} } = github;
        const { pull_request, repository } = context.payload;*/

        exec('pwd', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });

        /*if (tag_name != null || tag_name != '') {

            await octokit.repos.getReleaseByTag({
                //Params
                ...context.repo,
                 tag: tag_name,

            }).then(function(response) {
                //on Success
                if (response.status == 200) {
                    console.log("Release already exists");
                }

            }, function(error){
                //On failure
                console.log("On failure");

                octokit.repos.createRelease({
                    //Params
                    ...context.repo,
                    tag_name: tag_name,
                    name: tag_name,
                    draft: false,
                    prerelease: true

                }).then(function(res){
                    //on Success
                    console.log("create repo response: ", res);

                },function(err){
                    //on failure
                    console.log("create repo error: ",  err);
                });
            });
        }*/

    } catch (error) {

        console.log("catch error: ", error);
    }

    console.log("Action end");
}

run();
