# Claude Rules

## Working on GitHub Issues

1. All issues should be a new branch
    1. If the issue type has the enhancement label, the branch should start with "feature/"
    2. If the issue type has bug label, the branch should start with "fix/"
2. Issue branches should always be based off of "development"
3. Before creating an issue branch, ensure that the lastest code has been pulled
4. When finished with an issue build the components and restart the containers.
5. If the build and restart succeed, created and push a commit with all changed files.
6. Wait until I approve changes before submitting a pull request

## General rules

1. Prefer to use the 'gh' CLI for git operations.
2. After making any code change, perform a review pass.
    1. Every review pass should ensure all modified code has unit tests, all tests pass, all code passes linting rules, all code has been simplfied with reability in mind.