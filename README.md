# Starfish

![GitHub version](https://img.shields.io/github/v/release/indeedeng/starfish?color=informational) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity) ![GitHub](https://img.shields.io/github/license/indeedeng/starfish?color=lightgrey) [![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

## _Because Your Open Source Contributors Are Stars!_

<p align="left"> <img src="img/Indeed_OS_starfish_logo.png" alt="Starfish logo - Light blue circle with gold starfish in the middle and the link to github directory in the top right corner (github.com/indeedeng/starfish) " width="250" height="250" title = "Starfish logo"/> </p>

<br>

## This is a tool to:

- Parse a CSV of employee GitHub Ids
- Use those Ids, and the Github REST API, to check for open source contributions made by those employees between 2 specific dates
- Log out the ids of those employees (either GitHub Ids or another unique identifier you choose)

Starfish gives you the option of either using the default settings or making customizations.  

## Purpose

### The purpose of this tool is to make it easy for you to run your own FOSS Contributor Fund

Creating a FOSS contributor fund at your company is a great way to help sustain the open source software your company depends on!

FOSS Funds are democratized - anyone who has contributed to open source in a given cycle gets to vote that cycle for the project they are excited about.  
_You can use Starfish to determine which of your employees are eligible to vote within a specific time range._

For More Info on what a FOSS Contributor Fund is, and how to start your own, [Watch This Talk from FOSDEM](https://fosdem.org/2019/schedule/event/community_sustaining_foss_projects_democratizing_sponsorship/) or [Read This Post on Indeed's Engineering Blog](https://engineering.indeedblog.com/blog/2019/07/foss-fund-six-months-in/) or [This awesome article from Open Collective](https://blog.opencollective.com/indeeds-open-source-sustainability-strategy/)

# Getting Started

## Prerequisites

### First, clone the repo to your computer, then navigate to the starfish folder and run `npm ci`.

- This project runs on **node 12 or higher**, node 18 is preferred.
- `node -v`, will show you which version of node you're using on your machine.
- If your version is below 12, either update to a compatible version of node, or [install and use nvm](https://github.com/nvm-sh/nvm#about) so that Starfish can use a compatible node version without affecting other applications on your system.

### Next, make a .csv file with the GitHub Ids you're interested in checking, and, if desired, an "alternate id" to go with each

> #### Q&A Time!
>
> ##### What do you mean "alternate id"?
>
> I mean, if you normally identify your employees by some unique identifier- like an LDAP, their email, an employee id number, or even just their names- you can add that to the CSV so that your output is more useful to you. (For example, we find a list of the emails of every employee who's eligible to vote in the FOSS Fund that month to be really useful.)  
> If you decide not to use an 'alternate id', your list of eligible employees will just be a list of their GitHub ids.
>
> ##### Why CSV?
>
> We found that an easy way to get GitHub ids from Indeed employees was through a Google form that automatically recorded their Indeed email. From that form, we got a Google Sheet with employee info that is easily exported as a CSV file. (Go to File, Download As, and then choose CSV.)
>
> ##### How do I make a CSV?
>
> A CSV is just a file of comma-separated values, with a newline between each line. It looks like this:  
> My GitHub ID is:,Email Address  
> danisyellis,dgellis@indeed.com  
> octocat,octocat@github.com  
> thisNameWillThrowAnErrorBecauseItIsNotARealGithubId,fakePerson@example.com
>
> (Not all CSVs have a header, but Starfish does expect the first row of your CSV to be a header.)  
> You can create a CSV on your own by creating a file, giving it the file extension .csv, and making it look like the above example. Or, even if you're not using google forms to gather GitHub ids, you can still enter your data into a google sheet (one column per data field, one row per person) and download a CSV from that.

You may want to store multiple CSV files in a folder that's inside of Starfish, but not tracked by git, so we have set up `./CSVsToParse` for you.

### Then, get yourself GitHub authentication credentials.

Log in to GitHub and [register a new personal access token](https://github.com/settings/tokens/new) (you can find this under Profile > Settings > Developer Settings > Personal access token > "Generate new token"). Fill the "Note" field with e.g. "Starfish" or another description. You don't need to select any scopes. (By default, a token is allowed read-only access to public information, and that's all Starfish needs). Click "Generate token". Copy the access token and store it as you will need it for the next step.

### Next, Create a file named .env, copy the contents of the .env.template file into it, and add your values to the new file.

- Paste the access token into `GITHUB_TOKEN`.
- `TIMEZONE` allows you to specify which timezone Starfish should use to decide on which day a contribution happened.
    - The default is UTC, which works well for organizations with multiple locations. See the "Time zones" section for details.
- `CSV_COLUMN_NUMBER_FOR_GITHUB_ID` and `CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID` should match the columns in the input file.
    - The CSV you input will be turned into an array, so the numbers for the CSV columns are zero-indexed.
    - For example, in the example CSV above, `CSV_COLUMN_NUMBER_FOR_GITHUB_ID = "0"` and `CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID = "1"`
    - If you choose not to use an alternate id, you can put the same value in both fields.
- To filter out events for which the author is the owner of the repository, simply set `IGNORE_SELFOWNED_EVENTS = "true"`; otherwise leave it as `IGNORE_SELFOWNED_EVENTS = ""`.
- By default, Starfish will return the name of anyone who has at least 1 qualifying contribution within the time period. If you'd like to use a different number, you can change `MINIMUM_NUMBER_OF_CONTRIBUTIONS`.
- `GITHUB_IMPORTANT_EVENTS` contains a default set of events for Starfish to check. You can edit this list. It must contain a comma-separated list of events.
    - By default, this tool checks for CommitCommentEvents, IssueCommentEvents, IssuesEvents, PullRequestEvents, PullRequestReviewEvents, and PullRequestReviewCommentEvents.
    - We do not look for PushEvents because those are usually used for personal projects, not actual open source contributions.
    - Starfish allows you to filter events based on the specific action taken. For example, you might want to count when a pull request is opened, but not when it is closed. To do that, the list of important events can include basic types (like "PullRequestEvent") or a specific action of a type (like "PullRequestEvent.closed").
        You can list multiple actions for the same event type. Visit [GitHub event types](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/github-event-types#event-object-common-properties) for more information.

### Time zones

The `TIMEZONE` value must be one of the following:

- An empty string `''` which means UTC (aka GMT), and which is the default
- The word `'local'`, which means the local time zone
- a value from the [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). If you use this option, it would normally be the time zone of the organization's main office, such as `"America/Los_Angeles"`.

If for some reason you want the time to be a constant offset from UTC, you can say : `"Etc/GMT+6"`, to mean UTC-0600. **Note that positive values in the TIMEZONE string will result in negative UTC offsets** (that is, West of UTC), while **negative values will result in positive UTC offsets.** This behavior is defined by IANA, not by us.

For example:

```.env
TIMEZONE=“Etc/GMT+6”
```

would output:

```txt

Users that contributed between December 1, 2020, 12:00 AM GMT-6 and December 15, 2020, 11:59 PM GMT-6
```

For further reading see the [luxon time zone documentation](https://moment.github.io/luxon/docs/manual/zones) and the [List of tz values](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## To run:

In your terminal, type `node index.js {date1} {date2} {path/to/CSVfile}.csv`

> In the above, any text inside of curly brackets {} means that you should put your own value in.  
> Dates should be written in ISO-8601 format. For example, April 1, 2019 should be entered as `2019-04-01`.  
> Here's an example of what the terminal command could look like (I name my CSV files by date): `node index.js 2020-10-01 2020-11-01 CSVsToParse/2020-11-01.csv`

Tip: You can redirect the output to a file, if you like: `node index.js {date1} {date2} {path/to/CSVfile} > {nameOfFileToCreate}.txt`

## Updating

From time to time, we'll be updating the Starfish code. You can get the newest code with `git pull origin main`. Just be sure to run `npm ci` when you do that, in case any node packages were updated.

# Other Important Info

- Caveats: [The GitHub Rest API](https://docs.github.com/en/free-pro-team@latest/rest) only holds the most recent 300 events for each user. Also, events older than 90 days will not be included (even if the total number of events in the timeline is less than 300). So, if you're looking for contributions from 4 months ago, Starfish won't be able to find any. And if you are looking for contributions from 2 months ago, and one or more of your users is very active (300 events or more per month!), your result might not be completely accurate.

- Also, we know that there are many types of contributions to open source - not just code, and not just on GitHub. At Indeed, we have a Google form Indeedians can fill out to tell us about other contributions they've made. We recommend you do that as well.

- Lastly, if you're using Starfish we'd **_love_** to hear about it. What are you using Starfish for? Does it work well for you? You can leave us a comment over in the [Discussions](https://github.com/indeedeng/starfish/discussions).

# Changelog and Troubleshooting

## Changelog

**We recently created a [Changelog](https://github.com/indeedeng/starfish/discussions/100)** over in [Starfish's Discussions](https://github.com/indeedeng/starfish/discussions). **_If you're using Starfish, I'd recommend Subscribing to notifications for the Changelog._** We'll be posting there when big changes happen like interesting new features and, most importantly, when security issues arise and get patched.

## Troubleshooting

- **If you ran Starfish previously, pulled in new code, and are now having problems**, it's probably because we made some changes for version 2.0.0

    - Starfish 2.0.0 changes how we talk to GitHub's API, because the old way is now deprecated. When you pull in the latest code changes, you'll also want to look at [these Instructions](https://github.com/indeedeng/starfish/blob/master/README.md#then-get-yourself-github-authentication-credentials) to get a Personal Access Token for the GitHub API. Then, change your .env to use that token, instead of OAuth credentials.
    - Also, the `TIMEZONE_OFFSET` environment variable has become `TIMEZONE`. You'll want to change that as well, and most likely change the value you're giving it, as explained [here](https://github.com/indeedeng/starfish#next-create-a-file-named-env-copy-the-contents-of-the-envtemplate-file-into-it-and-add-your-values-to-the-new-file)

- **Whenever you pull in new code**, Make sure to run `npm ci` to update node packages.

- If you are having **other issues** (For example, if you need help switching your local clone's default branch from master to main), **check out the [Changelog](https://github.com/indeedeng/starfish/discussions/100).**

- **If you get any other errors you can't fix** please start a [Discussion](https://github.com/indeedeng/starfish/discussions/new) so we can help you get set up or fix any bugs we've missed in the code.

# Contributing

Always feel free to help out! Read our [contributing guide](https://github.com/indeedeng/starfish/blob/master/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

# Code of Conduct

Starfish is governed by the [Contributor Covenant v 1.4.1](CODE_OF_CONDUCT.md).

# License

Starfish is licensed under the [Apache 2 License](LICENSE).

# Maintainers

[danisyellis](https://github.com/danisyellis) and the rest of the Indeed Open Source team

<p align="center"> <img src="img/OS-gold-starfish-banner.png" alt="Banner of five cartoony gold-colored starfishes arranged like Olympic circles, but with some spacing between, on a background of water" width="596" height="255" title = "Gold Starfish Banner"/> </p>
