
const core = require('@actions/core');
const github = require('@actions/github');

async function run(){
    try{
        const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
        const tag_name = core.getInput('tag_name');

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
        console.log(context.repo);

        if (tag_name != null || tag != '') {

            const { status, data } = await octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
                owner: repository.owner.login,
                repo: repository.name,
                tag: tag_name
            })
        
            console.log("status: ", status);
            console.log("data: ", data);
        }

    } catch (error) {

        console.log("error: ", error);
    }

    console.log("Action end");
}

run();
