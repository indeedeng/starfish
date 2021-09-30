# Contributing

If you'd like to contribute, please open an issue describing what you want to change and why, or comment on an existing issue. We'd love to have you.

Here's an overview of Starfish's file structure - you may not need to touch most of it.

> -   `index.js` is the code's entry point.
> -   You'll find helper functions and variables that come from user settings/input in `globals.js` and `dateTimes.js`
> -   The main 'business logic' of Starfish is inside of `starfish.js`. This is where we fetch from GitHub, decide if an event is a valid contribution, and then log out the contributors who have valid events.
> -   Everything else is text files, image files, the gitignore (tells git which files/folders to ignore), a template for making the environment variables, a folder for tests, the package.json (which is a node configuration file), a folder to hold the CSV(s) of employee info, and files to configure eslint, prettier, and nvm.

#### Before submitting your Pull Request, please do each of the following steps, and fix any problems that come up:

1. Make sure the code runs and gives the output you expect.
1. If your change adds an environment variable, be sure to add it to the both the `.env.template` file and the `jest/setEnvVars.js` file. (setEnvVars.js is used to create environment variables for the tests.)
1. Check the README.md and this CONTRIBUTING.md to see if your change requires any new documentation or a change to existing documentation.
1. Run the linter `npm run lint` and/or `npm run lint-fix` and make sure everything passes.
1. Run the tests `npm test` and make sure everything passes. If your change adds new functionality, it would be great if you added a test for it too! (Our test suite is still a work in progress and doesn't cover everything yet, but it's getting there.)
1. Once you've pushed your commits to github, make sure that your branch can be auto-merged (there are no merge conflicts). If not, on your computer, merge master into your branch, resolve any merge conflicts, make sure everything still runs correctly and passes all the tests, and then push up those changes.

Thank you!
