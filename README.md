# Starfish
## Because Your Open Source Contributors are All Stars!

### This is a tool to
- parse a CSV, or just use an array, of employee GitHub Ids
- use those Ids, and the Github REST API, to check for open source contributions by those employees that happened between 2 different dates
- make a new text file with the GitHub Ids (LDAPS right now) of those employees

### You can use this tool to determine which of your employees are eligible to vote in your FOSS Contributor Fund each cycle
For More Info on what a FOSS Contributor Fund is, and how to start your own, -------Click here------------

#### To run:

First, run npm install.

Then, get yourself Github authentication credentials.
When logged in to GitHub, go to Settings, Developer Settings, OAuth Apps. Click the "new OAuth App" button and register a new OAuth app. For this app, you can fill this form out with anything and it won't matter. What does matter is that you fill out the form, click "Register Application", and have a Client ID and Client Secret.

Next, Create a file named .env and copy the contents of the .env.template file into it. In the .env file, Fill in the Client ID and Client Secret.

Finally, in your terminal, type `cat {path/to/CSV/file} | node contributors.js > {nameOfFileToCreate}.txt {date1} {date2} {hourOffset1} {hourOffset2}`
In the above, any text inside of curly brackets {} means that you should put your own value in.
Dates should be written in ISO-8601 format. For example, April 1, 2019 should be entered as 2019-04-01.
The time offset is used for ______timezones____ It should be written like this 06:00.

#### CSV?????
Yup. This tool can parse a CSV to make an array of Github Ids.
We found an easy way to get GitHub ids from Indeed employees was through a Google form that automatically recorded their Indeed email. From that, we got a Google Sheet with employee info that is easily exported as a CSV. If you do this too, you will use a slightly different command to first parse the CSV and then run the contributors command: `cat {path/to/CSV/file} | node contributors.js > {nameOfFileToCreate}.txt {date1} {date2} {hourOffset1} {hourOffset2}`


#### Other Important Info

This tool checks for CommitCommentEvents, IssueCommentEvents, IssuesEvents, PullRequestEvents, PullRequestReviewEvents, and PullRequestReviewCommentEvents. We do not look for PushEvents because those are usually used for personal projects, not actual open source contributions.

Caveat: The github API only holds the most recent 300 events for each user. So, if you are looking for contributions from a long time ago, and one of your users is very active, your result might not be completely accurate.

In the future, we hope to include other code repositories in this tool! If you'd like to contribute, please open an issue. We'd love to have you.
