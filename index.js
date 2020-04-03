require('dotenv').config();
const fetch = require('node-fetch');
const Moment = require('moment');
const { extendMoment } = require('moment-range');
const moment = extendMoment(Moment);
const parse = require('parse-link-header');

let arrayOfIdObjects = []; // each IdObject contains the GitHub Id PLUS Alternate Id for an individual (examples of alternate ids: an LDAP or company email- however your company identifies employees)
const githubToken = Buffer.from(process.env.GITHUB_TOKEN).toString('base64');
const githubIdColumnNumber = process.env.CSV_COLUMN_NUMBER_FOR_GITHUB_ID;
const alternateIdColumnNumber = process.env.CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID;
let githubImportantEvents = process.env.GITHUB_IMPORTANT_EVENTS;
if (!githubImportantEvents) {
    githubImportantEvents = ['CommitCommentEvent', 'IssueCommentEvent', 'IssuesEvent', 'PullRequestEvent', 'PullRequestReviewEvent', 'PullRequestReviewCommentEvent'];
} else {
    githubImportantEvents = githubImportantEvents.split(',');
}


//Helper Functions
function parseDatesFromArgv() {
    let startDate;
    let endDate;
    if (process.env.TIMEZONE_OFFSET) {
        startDate = process.argv[2] + ' ' + process.env.TIMEZONE_OFFSET;
        endDate = process.argv[3] + ' ' + process.env.TIMEZONE_OFFSET;
    } else {
        startDate = process.argv[2];
        endDate = process.argv[3];
    }

    return [startDate, endDate];
}

function filterResponseForImportantEvents(allEventsFromFetch) {
    let arrayOfImportantEvents = [];
    for (let i = 0; i < allEventsFromFetch.length; i++) {
        const event = allEventsFromFetch[i];
        if (githubImportantEvents.indexOf(event.type) !== -1) {
            arrayOfImportantEvents.push(event);
        }
    }

    return arrayOfImportantEvents;
}

function fetchPageOfDataAndFilter(url) {
    return new Promise((resolve) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${githubToken}`
            }
        })
            .then((response) => {
                let parsed = parse(response.headers.get('link'));
                let importantEvents = [];
                response.json()
                    .then((json) => {
                        let filteredForImportant = filterResponseForImportantEvents(json);
                        importantEvents = importantEvents.concat(filteredForImportant);
                        if (parsed && parsed.next && parsed.next.url) {
                            fetchPageOfDataAndFilter(parsed.next.url).then(newEvents => {
                                return resolve(importantEvents.concat(newEvents));
                            });
                        } else {
                            return resolve(importantEvents);
                        }
                    })
                    .catch(err => {
                        console.log('Error turning response into JSON:', err);
                    });
            })
            .catch(err => console.log('ERROR GRABBING INFO FROM GITHUB!', err));
    });
}

function createIdObjects(row, idObject, importantEvents) {
    idObject.alternateId = row[alternateIdColumnNumber];
    idObject.github = row[githubIdColumnNumber];
    idObject.contributions = importantEvents;
    arrayOfIdObjects.push(idObject);
}

function filterContributorByTime(idObject, dates) {
    const startDate = dates[0];
    const endDate = dates[1];
    const startMoment = moment.utc(`${startDate}`, 'YYYY-MM-DD hh:mm');
    const endMoment = moment.utc(`${endDate}`, 'YYYY-MM-DD hh:mm');

    const timeWindow = moment.range([startMoment, endMoment]);
    for (let i = 0; i < idObject.contributions.length; i++) {
        const momentOfContribution = moment.utc(idObject.contributions[i].created_at);
        if (timeWindow.contains(momentOfContribution)) {
            console.log(idObject.alternateId);
            break;
        }
    }
}
function fetchUserDataAndAddToCSV(row, dates) {
    let url = `https://api.github.com/users/${row[githubIdColumnNumber]}/events`;
    fetchPageOfDataAndFilter(url).then(importantEvents => {
        let idObject = {};
        createIdObjects(row, idObject, importantEvents);
        filterContributorByTime(idObject, dates);
    })
        .catch(err => {
            console.log('error', err);
        });
}


//parse CSV into JSON
const { Parser } = require('parse-csv');
const parser = new Parser();
const encoding = 'utf-8';
let csvData = '';

process.stdin.setEncoding(encoding);
process.stdin.on('readable', () => {
    let chunk;
    // eslint-disable-next-line no-cond-assign
    while (chunk = process.stdin.read()) {
        csvData += chunk;
    }
});
process.stdin.on('end', () => {
    const dates = parseDatesFromArgv();

    process.stdout.write(`Users that contributed between ${dates[0]} and ${dates[1]} \n`);

    var datagrid = parser.parse(csvData).data;
    let arrayOfGithubIds = [];
    //detect duplicates, add user events, and send the the csv to stdout
    for (let i = 1; i < datagrid.length; i++) {
        let currentRow = datagrid[i];
        let duplicateGithubId = false;
        for (let j = 0; j < arrayOfGithubIds.length; j++) {
            if (arrayOfGithubIds[j] === currentRow[githubIdColumnNumber]) {
                console.log('Ignoring Duplicate GitHub ID- you should probably erase one instance of this github id from your CSV:', currentRow[githubIdColumnNumber]);
                duplicateGithubId = true;
                break;
            }
        }
        if (duplicateGithubId === true) {
            continue;
        }
        arrayOfGithubIds.push(currentRow[githubIdColumnNumber]);
        fetchUserDataAndAddToCSV(currentRow, dates);
    }
});

module.exports = filterResponseForImportantEvents;
