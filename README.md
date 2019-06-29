# Starfish
## Because Your Open Source Contributors Are Stars!

<img src="https://images.unsplash.com/photo-1534837306493-691bb3cb0db2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60" width="244" height="183" title = "Photo by Clara Cordero on Unsplash"/>

## This is a tool to:
- parse a CSV of employee GitHub Ids
- use those Ids, and the Github REST API, to check for open source contributions by those employees that happened between any 2 dates
- log out the ids of those employees (either GitHub Ids or another unique identifier you choose)

## Purpose
#### The purpose of this tool is to make it easy for you to run your own FOSS Contributor Fund
Creating a FOSS contributor fund at your company is a great way to help sustain the open source software your company depends on!

FOSS Funds are democratized - anyone who has contributed to open source in a given cycle gets to vote that cycle for the project they are excited about.  
*You can use Starfish to determine which of your employees are eligible to vote within a specific time range.*

For More Info on what a FOSS Contributor Fund is, and how to start your own, [Click Here](https://fosdem.org/2019/schedule/event/community_sustaining_foss_projects_democratizing_sponsorship/)

# Getting Started
### Prerequisites

#### First, clone the repo to your computer, then navigate to the starfish folder and run `npm install`.

#### Next, make a .csv file with the Github Ids you're interested in checking, and, if desired, an "alternate id" to go with each
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
anexample,example@example.com  
nerys,kira@bm.gov  
captsisko,bsisko@starfleet.com  

> (Not all CSVs have a header, but Starfish does expect the first row of your CSV to be a header.)
> You can create this on your own by creating a file, giving it the file extension .csv, and making it look like the above example. Or, even if you're not using google forms to gather GitHub ids, you can still enter your data into a google sheet and download a CSV from that.

#### Then, get yourself Github authentication credentials.
When logged in to GitHub, go to Settings, Developer Settings, OAuth Apps. Click the "new OAuth App" button and register a new OAuth app. For use with Starfish, you can fill this form out with anything and it won't matter. What does matter is that you fill out the form, click "Register Application", and obtain a Client ID and Client Secret.

#### Next, Create a file named .env, copy the contents of the .env.template file into it, and add your values to the new file.
- Fill in the GitHub Client ID and Github Client Secret.
- By default, the time window uses UTC-0 (same as GMT). If that's acceptable, leave TIMEZONE_OFFSET as an empty string. If you want your time to be local, provide a UTC offset here.
Example: California is UTC-08:00 (half the year) so I would make the TIMEZONE_OFFSET equal to "08:00".
- The CSV you input will be turned into an array, so the numbers for the CSV columns are zero-indexed. If you choose not to use an alternate id, you can put the same column number in both CSV_COLUMN_NUMBER_FOR_GITHUB_ID and CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID.

### To run:
In your terminal, type `cat {path/to/CSVfile} | node index.js {date1} {date2}`  
> In the above, any text inside of curly brackets {} means that you should put your own value in.  
> Dates should be written in ISO-8601 format. For example, April 1, 2019 should be entered as 2019-04-01.

Reminder: You can pipe the output to a file, if you like: `cat {path/to/CSVfile} | node index.js > {nameOfFileToCreate}.txt {date1} {date2}`

### Tests
We've just started writing tests - there's one so far. You can run it with the command `npm test`.


# Other Important Info

This tool checks for CommitCommentEvents, IssueCommentEvents, IssuesEvents, PullRequestEvents, PullRequestReviewEvents, and PullRequestReviewCommentEvents. We do not look for PushEvents because those are usually used for personal projects, not actual open source contributions.

Caveat: The github API only holds the most recent 300 events for each user. So, if you are looking for contributions from a long time ago, and one of your users is very active, your result might not be completely accurate.

## Contributing
In the future, we hope to include other code repositories (like Gitlab & Bitbucket) and other tools people use to make software (like Jira) in this tool! If you'd like to contribute, please open an issue describing what you want to change and why, or comment on an existing issue. We'd love to have you.

# Code of Conduct
Starfish is governed by the [Contributor Covenant v 1.4.1](CODE_OF_CONDUCT.md).

# License
Starfish is licensed under the [Apache 2 License](LICENSE).

#### Maintainers
[danisyellis](https://github.com/danisyellis)

<img align="left" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx4qXPsK4SXsr542YR35pYvLpshJytPWB0iJYGHTKeAHQMVxFkbw" width="271" height="180" title = "Photo from Creativity103 on Flickr"/>
<img align="left" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx4qXPsK4SXsr542YR35pYvLpshJytPWB0iJYGHTKeAHQMVxFkbw" width="271" height="180" title = "Photo from Creativity103 on Flickr"/>
<img align="left" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx4qXPsK4SXsr542YR35pYvLpshJytPWB0iJYGHTKeAHQMVxFkbw" width="271" height="180" title = "Photo from Creativity103 on Flickr"/>


