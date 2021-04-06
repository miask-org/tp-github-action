const core = require('@actions/core');
const github = require('@actions/github');

async function run() {

	const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');

	const { context = {} } = github;
	const { pull_request } = context.payload;
  	
  	await octokit.issues.createComment({
	  ...context.repo,
	  issue_number: pull_request.number,
	  body: 'Thank you for submitting a pull request! We will try to review this as soon as we can.'
	});
}

run();