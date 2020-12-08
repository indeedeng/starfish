require('dotenv').config();
const fetch = require('node-fetch');
const Moment = require('moment-timezone');
const { extendMoment } = require('moment-range');
const moment = extendMoment(Moment);
const parse = require('parse-link-header');

function getOrThrow(configField) {
    const value = process.env[configField];
    if (!value) {
        throw new Error(
            `${configField} is required. Please create a .env file, based off of the .env.template file, and ensure that all variables have values (no empty quotes)`
        );
    }

    return value;
}
const githubToken = Buffer.from(getOrThrow('GITHUB_TOKEN')).toString('base64');
const githubIdColumnNumber = getOrThrow('CSV_COLUMN_NUMBER_FOR_GITHUB_ID');
const alternateIdColumnNumber = getOrThrow('CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID');
let githubImportantEvents = getOrThrow('GITHUB_IMPORTANT_EVENTS').split(',');

const ignoreSelfOwnedEvents = (process.env.IGNORE_SELFOWNED_EVENTS || 'false').toLowerCase();
console.log(`Configuration set to ignore self-owned events? ${ignoreSelfOwnedEvents}`);
if (ignoreSelfOwnedEvents !== 'true' && ignoreSelfOwnedEvents !== 'false') {
    console.error(`IGNORE_SELFOWNED_EVENTS must be "true" or "false"`);
    process.exit(1);
}

//Helper Functions
function parseDatesFromArgv() {
    const timeZone = getOrThrow('TIMEZONE');
    const startDate = process.argv[2];
    const endDate = process.argv[3];

    const startMoment = moment.tz(startDate, timeZone).startOf('day');

    const endMoment = moment.tz(endDate, timeZone).endOf('day');

    return [startMoment, endMoment];
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

function shouldIncludeEvent(eventType) {
    const isAuthorAlsoTheOwner = eventType.author_association !== 'OWNER';
    return !isAuthorAlsoTheOwner;
}

function filterByAuthorAssociation(events) {
    const filteredEvents = events.filter((event) => {
        switch (event.type) {
            case 'PullRequestEvent':
            case 'PullRequestReviewEvent':
                return shouldIncludeEvent(event.payload.pull_request);
            case 'CommitCommentEvent':
            case 'IssueCommentEvent':
            case 'PullRequestReviewCommentEvent':
                return shouldIncludeEvent(event.payload.comment);
            case 'IssuesEvent':
                return shouldIncludeEvent(event.payload.issue);
            default:
                return false;
        }
    });

    return filteredEvents;
}

function fetchPageOfDataAndFilter(url) {
    return new Promise((resolve) => {
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${githubToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    console.error(`Error: ${response.status} ${response.statusText} \nFor: ${url}`);
                    throw new Error(response.statusText);
                }
                let parsed = parse(response.headers.get('link'));
                let importantEvents = [];
                response
                    .json()
                    .then((json) => {
                        let filteredForImportant = filterResponseForImportantEvents(json);

                        importantEvents = importantEvents.concat(filteredForImportant);

                        if (ignoreSelfOwnedEvents === 'true') {
                            importantEvents = filterByAuthorAssociation(importantEvents);
                        }
                        if (parsed && parsed.next && parsed.next.url) {
                            fetchPageOfDataAndFilter(parsed.next.url)
                                .then((newEvents) => {
                                    return resolve(importantEvents.concat(newEvents));
                                })
                                .catch((err) => {
                                    console.error(
                                        `Error fetching page of data for ${parsed.next.url}: ${err}`
                                    );
                                    throw err;
                                });
                        } else {
                            return resolve(importantEvents);
                        }
                    })
                    .catch((err) => {
                        console.error('Error turning response into JSON:', err);
                    });
            })
            .catch((err) => console.error('ERROR GRABBING INFO FROM GITHUB!', err));
    });
}

function createIdObject(row, importantEvents) {
    return {
        alternateId: row[alternateIdColumnNumber],
        github: row[githubIdColumnNumber],
        contributions: importantEvents,
    };
}

function filterContributorByTime(idObject, moments) {
    const startMoment = moments[0];
    const endMoment = moments[1];

    const timeWindow = moment.range([startMoment, endMoment]);
    for (let i = 0; i < idObject.contributions.length; i++) {
        const momentOfContribution = moment.utc(idObject.contributions[i].created_at);
        if (timeWindow.contains(momentOfContribution)) {
            console.log(idObject.alternateId);
            break;
        }
    }
}
function fetchUserDataAndAddToCSV(row, moments) {
    let url = `https://api.github.com/users/${row[githubIdColumnNumber]}/events`;
    fetchPageOfDataAndFilter(url)
        .then((importantEvents) => {
            const idObject = createIdObject(row, importantEvents);
            filterContributorByTime(idObject, moments);
        })
        .catch((err) => {
            console.error('error', err);
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
    while ((chunk = process.stdin.read())) {
        csvData += chunk;
    }
});
process.stdin.on('end', () => {
    const moments = parseDatesFromArgv();

    process.stdout.write(`Users that contributed between ${moments[0]} and ${moments[1]} \n`);

    const datagrid = parser.parse(csvData).data;
    const uniqueIds = new Set();

    for (let i = 1; i < datagrid.length; i++) {
        const currentRow = datagrid[i];
        const currentId = currentRow[githubIdColumnNumber];
        if (uniqueIds.has(currentId)) {
            console.log(
                `Ignoring Duplicate GitHub ID- you should probably erase one instance of this github id from your CSV: ${currentId}`
            );
        } else {
            uniqueIds.add(currentId);

            const delayToAvoidOverwhelmingMacNetworkStack = i * 10;
            setTimeout(() => {
                fetchUserDataAndAddToCSV(currentRow, moments);
            }, delayToAvoidOverwhelmingMacNetworkStack);
        }
    }
});

module.exports = {
    createIdObject,
    fetchPageOfDataAndFilter,
    fetchUserDataAndAddToCSV,
    filterContributorByTime,
    filterResponseForImportantEvents,
    getOrThrow,
    parseDatesFromArgv,
};
