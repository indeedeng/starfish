# Starfish
[![GitHub version](https://badge.fury.io/gh/indeedeng%2Fstarfish.svg)](https://badge.fury.io/gh/indeedeng%2Fstarfish) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity) ![GitHub](https://img.shields.io/github/license/indeedeng/starfish?style=flat-square) [![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)


## *Because Your Open Source Contributors Are Stars!*

<p align="left"> <img src="img/Indeed_OS_starfish_logo.png" alt="Starfish logo" width="244" height="244" title = "Starfish logo"/> </p>

<br>

## Indeed + Hacktoberfest

In addition to the main Hacktoberfest event, [Indeed.com](https://indeed.com) is sponsoring additional activities --
see [Indeed Hacktoberfest 2020](https://engineering.indeedblog.com/indeed-hacktoberfest-2020/) for details

Note: If you'd like to contribute, please either work on an issue labeled Hacktoberfest or create an issue to talk about the change you'd like to make. Spammy pull requests just to get swag are against the spirit of Hacktoberfest and won't be accepted. Remember, the purpose of Hacktoberfest is to support open source projects, not to create extra work for open source maintainers. If you're new to open source, please don't let this note discourge you though- we're happy to work with people who want to submit PRs in good faith, even if it's a small change or you're still learning :-)

### Hacktoberfest Open Office Hours
Join us for open office hours to talk about issues, propose ideas, help review code, and more.

| Date         | Time           | Register  |
| ------------- |:-------------:| -----:|
| Wednesday, October 14th | 4PM-5PM PT | [register](https://organize.mlh.io/participants/events/5666-virtual-starfish-office-hours) |
| Monday, October 26th | 2PM-3PM PT | [register](https://organize.mlh.io/participants/events/5668-virtual-starfish-office-hours) |
<br>

## This is a tool to:
- parse a CSV of employee GitHub Ids
- use those Ids, and the GitHub REST API, to check for open source contributions by those employees that happened between any 2 dates
- log out the ids of those employees (either GitHub Ids or another unique identifier you choose)

## Purpose
#### The purpose of this tool is to make it easy for you to run your own FOSS Contributor Fund
Creating a FOSS contributor fund at your company is a great way to help sustain the open source software your company depends on!

FOSS Funds are democratized - anyone who has contributed to open source in a given cycle gets to vote that cycle for the project they are excited about.  
*You can use Starfish to determine which of your employees are eligible to vote within a specific time range.*

For More Info on what a FOSS Contributor Fund is, and how to start your own, [Watch This Talk from FOSDEM](https://fosdem.org/2019/schedule/event/community_sustaining_foss_projects_democratizing_sponsorship/) or [Read This Post on Indeed's Engineering Blog](https://engineering.indeedblog.com/blog/2019/07/foss-fund-six-months-in/) or [This awesome article from Open Collective](https://blog.opencollective.com/indeeds-open-source-sustainability-strategy/)

# NOTE FOR CURRENT STARFISH USERS - BREAKING CHANGES
Hi, thanks for using Starfish. Recently, we pushed up Starfish 2.0.0 which changes how we talk to GitHub's API, because the old way is now deprecated. When you pull in the latest code changes, you'll also want to look at [these Instructions](https://github.com/indeedeng/starfish/blob/master/README.md#then-get-yourself-github-authentication-credentials) to get a Personal Access Token for the GitHub API. Then, change your .env to use that token, instead of OAuth credentials.

Also, the TIMEZONE_OFFSET environment variable has become TIMEZONE. You'll want to change that as well, and most likely change the value you're giving it, as explained [here](https://github.com/indeedeng/starfish#next-create-a-file-named-env-copy-the-contents-of-the-envtemplate-file-into-it-and-add-your-values-to-the-new-file)

Make sure to run `npm ci` to update node packages.

New users, you don't have to worry about this - just follow the instructions in _Getting Started_ below.

# Getting Started
### Prerequisites

#### First, clone the repo to your computer, then navigate to the starfish folder and run `npm ci`.
- This project runs on **node 10.13.0 or higher**, node 12 is preferred.
- `node -v `, will show you which version of node you're using in your machine.
- If your version is below 10.13.0, either update to a compatible version of node, or [install nvm](https://github.com/nvm-sh/nvm#about) so that Starfish can use a compatible node version without affecting other applications on your system.

#### Next, make a .csv file with the GitHub Ids you're interested in checking, and, if desired, an "alternate id" to go with each
> #### Q&A Time!
> ##### What do you mean "alternate id"?
> I mean, if you normally identify your employees by some unique identifier- like an LDAP, their email, an employee id number, or even just their names- you can add that to the CSV so that your output is more useful to you. (For example, we find a list of the emails of every employee who's eligible to vote in the FOSS Fund that month to be really useful.)  
If you decide not to use an 'alternate id', your list of eligible employees will just be a list of their GitHub ids.
> ##### Why CSV?
> We found that an easy way to get GitHub ids from Indeed employees was through a Google form that automatically recorded their Indeed email. From that form, we got a Google Sheet with employee info that is easily exported as a CSV file. (Go to File, Download As, and then choose CSV.)
> ##### How do I make a CSV?
> A CSV is just a file of comma-separated values, with a newline between each line. It looks like this:  
My GitHub ID is:,Email Address  
danisyellis,dgellis@indeed.com  
octocat,octocat@github.com  
thisShouldError,notaname@example.com 

> (Not all CSVs have a header, but Starfish does expect the first row of your CSV to be a header.)  
> You can create a CSV on your own by creating a file, giving it the file extension .csv, and making it look like the above example. Or, even if you're not using google forms to gather GitHub ids, you can still enter your data into a google sheet (one column per data field, one row per person) and download a CSV from that.

You may want to store multiple CSV files in a folder that's inside of Starfish, but not tracked by git, so we have set up `./CSVsToParse` for you.

#### Then, get yourself GitHub authentication credentials.
Log in to GitHub and [register a new personal access token](https://github.com/settings/tokens/new) (you can find this under Profile > Settings > Developer Settings > Personal access token > "Generate new token"). Fill the "Note" field with e.g. "Starfish" or another description. You don't need to select any scopes. (By default, a token is allowed read-only access to public information, and that's all Starfish needs). Click "Generate token". Copy the access token and store it as you will need it for the next step.

#### Next, Create a file named .env, copy the contents of the .env.template file into it, and add your values to the new file.
- Paste the access token into GITHUB_TOKEN
- TIMEZONE allows you to specify when your day begins and ends. This must be a value from the [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). Typically, this would either be "Etc/UTC" or the time zone of your organization's main office, such as "America/Los_Angeles". 

If for some reason you want the time to be a constant offset from UTC, you can say : "Etc/GMT+6", to mean UTC-0600. **Note that positive values in the TIMEZONE string will result in negative UTC offsets** (that is, West of UTC), while **negative values will result in positive UTC offsets.** This is a result of IANA, not by choice. 
For example: 
``` .env
TIMEZONE=“Etc/GMT+6”
```

would output:


``` 

Users that contributed between Tue Mar 31 2020 00:00:00 GMT-0600 and Tue Apr 07 2020 23:59:59 GMT-0600 
```


For further reading visit [moment-timezone](https://momentjs.com/timezone/docs) and [List of tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
- The CSV you input will be turned into an array, so the numbers for the CSV columns are zero-indexed. For example, in the example CSV above, CSV_COLUMN_NUMBER_FOR_GITHUB_ID = 0 and CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID = 1. If you choose not to use an alternate id, you can put the same column number in both CSV_COLUMN_NUMBER_FOR_GITHUB_ID and CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID.

### To run:
In your terminal, type `cat {path/to/CSVfile}.csv | node index.js {date1} {date2}`  
> In the above, any text inside of curly brackets {} means that you should put your own value in.  
> Dates should be written in ISO-8601 format. For example, April 1, 2019 should be entered as 2019-04-01.

Reminder: You can pipe the output to a file, if you like: `cat {path/to/CSVfile} | node index.js > {nameOfFileToCreate}.txt {date1} {date2}`

### Tests
We've just started writing tests - there's one so far. You can run it with the command `npm test`.

### Updating
From time to time, we'll be updating the Starfish code. You can get the newest code with git pull origin master. Just be sure to run `npm ci` when you do that, in case any node packages were updated.


# Other Important Info

This tool by default checks for CommitCommentEvents, IssueCommentEvents, IssuesEvents, PullRequestEvents, PullRequestReviewEvents, and PullRequestReviewCommentEvents. We do not look for PushEvents because those are usually used for personal projects, not actual open source contributions.

You can also override the list of events to check by editing the "GITHUB_IMPORTANT_EVENTS" variable in your ".env" file with a comma-separated list of events

Caveats: The GitHub Rest API only holds the most recent 300 events for each user. Also, events older than 90 days will not be included (even if the total number of events in the timeline is less than 300). So, if you're looking for contributions from 4 months ago, Starfish won't be able to find any. And if you are looking for contributions from 2 months ago, and one or more of your users is very active (300 events or more per month!), your result might not be completely accurate. 

Also, we know that there are many types of contributions - not just code, and not just on GitHub. At Indeed, we have a Google form Indeedians can fill out to tell us about other contributions they've made. We recommend you do that as well.

Lastly, if you're using Starfish we'd love to hear about it. What are you using Starfish for? Does it work well for you? You can leave us a comment by creating an issue or by emailing [danisyellis](https://github.com/danisyellis).

# Contributing
If you'd like to contribute, please open an issue describing what you want to change and why, or comment on an existing issue. We'd love to have you.

Starfish's file structure is relatively simple - you won't need to touch most of it.

>Currently, all of the application code is in index.js
>Everything else is text files, image files, the gitignore (tells git which files/folders to ignore), a template for making the environment variables, a folder for tests, the package.json (which is a node configuration file), a folder to hold the CSV(s) of employee info, and files to configure eslint, prettier, and nvm.

#### Before submitting your Pull Request, please do each of the following steps, and fix any problems that come up:

1. Make sure the code runs and gives the output you expect.
1. Run the linter `npm run lint` and/or `npm run lint-fix` and make sure everything passes.
1. Run the tests `npm test` and make sure everything passes.
1. Once you've pushed your commits to github, make sure that your branch can be auto-merged (there are no merge conflicts).

Thanks!

# Code of Conduct
Starfish is governed by the [Contributor Covenant v 1.4.1](CODE_OF_CONDUCT.md).

# License
Starfish is licensed under the [Apache 2 License](LICENSE).

#### Maintainers
[danisyellis](https://github.com/danisyellis), Indeed Open Source
- feel free to open an issue if you have any questions about how to use Starfish. I'm happy to help.


<p align="center"> <img src="img/OS-gold-starfish-banner.png" alt="Gold Starfish Banner" width="596" height="255" title = "Gold Starfish Banner"/> </p>
