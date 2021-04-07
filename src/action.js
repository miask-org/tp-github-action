
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

        const ex = exec('pwd');
        console.log(ex);

        if (tag_name != null || tag_name != '') {

            const { status } = await octokit.repos.getReleaseByTag({
              ...context.repo,
              tag: tag_name,
            });

            console.log("status: ", status);

            if (status != 200 ) {

                const { status } = await octokit.repos.createRelease({
                  ...context.repo,
                  tag_name: tag_name,
                  name: tag_name,
                  draft: false,
                  prerelease: true
                });
            }
        }

    } catch (error) {

        console.log("error: ", error);
    }

    console.log("Action end");
}

run();
