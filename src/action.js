
const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('child_process');

async function run(){
    try{
        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        const tag_name = core.getInput('tag_name');

        const octokit = github.getOctokit(GITHUB_TOKEN);

        const { context = {} } = github;
        const { pull_request, repository } = context.payload;

        //const ex = exec('pwd');
        //console.log(ex);

        if (tag_name != null || tag_name != '') {

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

                const resp = octokit.repos.createRelease({
                    //Params
                    ...context.repo,
                    tag_name: tag_name,
                    name: tag_name,
                    draft: false,
                    prerelease: true

                });

                console.log(resp); /*.then(function(response){
                    //on Success
                    console.log("create repo response: "response);

                },function(error){
                    //on failure
                    console.log("create repo error": error);
                });*/
            });
        }

    } catch (error) {

        console.log("catch error: ", error);
    }

    console.log("Action end");
}

run();
