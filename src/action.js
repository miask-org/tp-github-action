
const core = require('@actions/core');
const github = require('@actions/github');

async function run(){
    try{
        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        
        const octokit = github.getOctokit(GITHUB_TOKEN);

        const { context = {} } = github;
        const { pull_request, repository } = context.payload;

        //await octokit.issues.createComment({
        //    ... context.repo,
        //    issue_number: pull_request.number,
        //    body: 'Thank you submitting a pull request! We will try to review as soon as we can',
        //  });

        //console.log(pull_request.title);
        //console.log(pull_request.body);
        //console.log(pull_request.number);

        //console.log("payload: %j", context.payload)
        console.log(repository.full_name);
        
        const { status, data } = await octokit.request('GET /repos/{repo}/releases/tags/v2', {
            repo: repository.full_name
        })

        console.log("status: ", status);
        console.log("data: ", data);

    } catch (error) {

        console.log("error: ", error);
    }

    console.log("Action end");
}

run();
