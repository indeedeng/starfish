# Starfish
## Because Your Open Source Contributors Are Stars!

### This is a tool to
- parse a CSV, or just use an array, of employee GitHub Ids
- use those Ids, and the Github REST API, to check for open source contributions by those employees that happened between 2 different dates
- make a new text file with the GitHub Ids (LDAPS right now) of those employees

### Purpose
#### The purpose of this tool is to make it easy for you to run your own FOSS Contributor Fund
Creating a FOSS contributor fund at your company is a great way to help sustain the open source software your company depends on!
FOSS Funds are democratized - anyone who has contributed to open source in a given cycle gets to vote that cycle for the project they are excited about.
You can use Starfish to determine which of your employees are eligible to vote within a specific time range.
For More Info on what a FOSS Contributor Fund is, and how to start your own, [Click Here](https://fosdem.org/2019/schedule/event/community_sustaining_foss_projects_democratizing_sponsorship/)

# Getting Started
### Prerequisites

#### First, run npm install.

#### Then, get yourself Github authentication credentials.
When logged in to GitHub, go to Settings, Developer Settings, OAuth Apps. Click the "new OAuth App" button and register a new OAuth app. For this app, you can fill this form out with anything and it won't matter. What does matter is that you fill out the form, click "Register Application", and have a Client ID and Client Secret.

#### Next, Create a file named .env and copy the contents of the .env.template file into it.
- In the .env file, Fill in the Client ID and Client Secret.
- By default, the time window uses UTC-0 (same as GMT). If that's acceptable, leave TIMEZONE_OFFSET as an empty string. If you want your time to be local, provide a UTC offset here.
Example: California is UTC-08:00 (half the year) so I would make the TIMEZONE_OFFSET equal to "08:00".

#### Also, you will need either an array of the Github Ids you're interested in, or a CSV that can be parsed to create that array
#### CSV?????
Yup. This tool can parse a CSV to make an array of Github Ids.
We found that an easy way to get GitHub ids from Indeed employees was through a Google form that automatically recorded their Indeed email. From that, we got a Google Sheet with employee info that is easily exported as a CSV. If you do this too, you will use a slightly different command to first parse the CSV and then run the contributors command: `cat {path/to/CSVfile} | node parseCSVAndGetContributors.js > {nameOfFileToCreate}.txt {date1} {date2}`
#### NO CSV, Just an array
_____________ info here __________

### To run:
In your terminal, type `cat {path/to/javascriptArray} | node contributors.js > {nameOfFileToCreate}.txt {date1} {date2}`
In the above, any text inside of curly brackets {} means that you should put your own value in.
Dates should be written in ISO-8601 format. For example, April 1, 2019 should be entered as 2019-04-01.


## Other Important Info

This tool checks for CommitCommentEvents, IssueCommentEvents, IssuesEvents, PullRequestEvents, PullRequestReviewEvents, and PullRequestReviewCommentEvents. We do not look for PushEvents because those are usually used for personal projects, not actual open source contributions.

Caveat: The github API only holds the most recent 300 events for each user. So, if you are looking for contributions from a long time ago, and one of your users is very active, your result might not be completely accurate.

## Contributing
In the future, we hope to include other code repositories (like Gitlab & Bitbucket) and other tools people use to make software (like Jira) in this tool! If you'd like to contribute, please open an issue describing what you want to change and why. We'd love to have you.

# Code of Conduct
Starfish is governed by the [Contributor Covenant v 1.4.1](CODE_OF_CONDUCT.md).

# License
Starfish is licensed under the [Apache 2 License](LICENSE).

#### Maintainers
[danisyellis](https://github.com/danisyellis)
