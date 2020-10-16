require('dotenv').config();
const fetch = require('node-fetch');
const { DateTime } = require('luxon');
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

//Helper Functions
function parseDatesFromArgv() {
    const timeZone = getOrThrow('TIMEZONE');
    const startDate = process.argv[2];
    const endDate = process.argv[3];

    const startMoment = DateTime.fromISO(startDate, {
        zone: timeZone || 'utc',
        setZone: true,
    });

    const endMoment = DateTime.fromISO(endDate, {
        zone: timeZone || 'utc',
        setZone: true,
    });

    return [startMoment.toISO(), endMoment.toISO()];
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
                Authorization: `Basic ${githubToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error: ${response.status} ${response.statusText} \nFor: ${url}`);
                    throw new Error(response.statusText);
                }
                let parsed = parse(response.headers.get('link'));
                let importantEvents = [];
                response
                    .json()
                    .then((json) => {
                        let filteredForImportant = filterResponseForImportantEvents(json);
                        importantEvents = importantEvents.concat(filteredForImportant);
                        if (parsed && parsed.next && parsed.next.url) {
                            fetchPageOfDataAndFilter(parsed.next.url)
                                .then((newEvents) => {
                                    return resolve(importantEvents.concat(newEvents));
                                })
                                .catch((err) => {
                                    console.log(
                                        `Error fetching page of data for ${parsed.next.url}: ${err}`
                                    );
                                    throw err;
                                });
                        } else {
                            return resolve(importantEvents);
                        }
                    })
                    .catch((err) => {
                        console.log('Error turning response into JSON:', err);
                    });
            })
            .catch((err) => console.log('ERROR GRABBING INFO FROM GITHUB!', err));
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
    const startMoment = DateTime.fromISO(moments[0]);
    const endMoment = DateTime.fromISO(moments[1]);

    for (let i = 0; i < idObject.contributions.length; i++) {
        const momentOfContribution = DateTime.fromISO(idObject.contributions[i].created_at, {
            zone: 'utc',
            setZone: true,
        });

        if (
            momentOfContribution.startOf('day') >= startMoment.startOf('day') &&
            momentOfContribution.startOf('day') <= endMoment.startOf('day')
        ) {
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
    while ((chunk = process.stdin.read())) {
        csvData += chunk;
    }
});
process.stdin.on('end', () => {
    const moments = parseDatesFromArgv();

    process.stdout.write(
        `Users that contributed between ${DateTime.fromISO(
            moments[0]
        ).toHTTP()} and ${DateTime.fromISO(moments[1]).toHTTP()} \n`
    );

    var datagrid = parser.parse(csvData).data;
    let arrayOfGithubIds = [];
    //detect duplicates, add user events, and send the the csv to stdout
    for (let i = 1; i < datagrid.length; i++) {
        let currentRow = datagrid[i];
        let duplicateGithubId = false;
        for (let j = 0; j < arrayOfGithubIds.length; j++) {
            if (arrayOfGithubIds[j] === currentRow[githubIdColumnNumber]) {
                console.log(
                    'Ignoring Duplicate GitHub ID- you should probably erase one instance of this github id from your CSV:',
                    currentRow[githubIdColumnNumber]
                );
                duplicateGithubId = true;
                break;
            }
        }
        if (duplicateGithubId === true) {
            continue;
        }
        arrayOfGithubIds.push(currentRow[githubIdColumnNumber]);
        fetchUserDataAndAddToCSV(currentRow, moments);
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
