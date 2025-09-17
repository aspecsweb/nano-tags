# Contributing to the nano-tags

Thanks for helping improve the nano-tags. This file describes how to get started, how to open issues and pull requests, and what we expect from contributors.

## Getting started / Setup

Follow these steps to set up a development environment.
*Use the [GitFlow Conventions](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)*

1. Fork the repo and clone your fork:
*git clone [https://github.com/aspecsweb/nanosights.git](https://github.com/aspecsweb/nanosights.git)*

1. Install the dependencies in every `tags/*` directory
*npm install*

1. Create and switch to a feature branch:
*git checkout -b feat/your-feature*

## Testing
To test your changes you can use [npm link](https://docs.npmjs.com/cli/v9/commands/npm-link). Otherwise we would need to release the packages with every new line of code.

1. Go to a tag folder (e.g. `tags/nano-analytics`) and use the link command
*npm link*

1. Now go to a local project of your own (Astro, Angular etc.) and "link-install"
*npm link nano-analytics*

1. You should see the `nano-analytics` package inside your `node_modules/` with a link-icon.

## Filing issues

- Search existing issues before opening a new one.
- Use a clear title and describe the problem or feature request.
- Include:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment (OS, versions, relevant config)
  - Minimal reproducible example or logs
- Tag the issue with an appropriate label if possible.

## Pull request guidelines

- Open a PR against the main branch (use a feature branch locally).
- Keep PRs small and focused.
- Include a descriptive title and summary of changes.
- Reference related issue(s) with “Fixes #NNN” when applicable.
- Follow the repository’s code style and formatting.
- Squash or rebase commits if requested by maintainers.

## Code style, tests, and quality

- Lint and format code according to the project's conventions.

## Community and behavior

Be respectful, constructive, and patient. Adhere to the project's Code of Conduct:

- If you encounter unacceptable behavior, contact the maintainers.