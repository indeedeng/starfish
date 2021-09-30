const {
    alternateIdColumnNumber,
    githubIdColumnNumber,
    githubImportantEvents,
    githubToken,
    ignoreSelfOwnedEvents,
    minimumNumberOfContributions,
} = require('./globals');
const { createLuxonDateTimeFromIso } = require('./dateTimes');
const fetch = require('node-fetch');
const parse = require('parse-link-header');

function isEventImportant(event) {
    const type = event.type;

    if (githubImportantEvents.indexOf(type) >= 0) {
        return true;
    }
    if (event.payload) {
        const typeWithAction = `${type}.${event.payload.action}`;
        if (githubImportantEvents.indexOf(typeWithAction) >= 0) {
            return true;
        }
    }

    return false;
}

function filterResponseForImportantEvents(allEventsFromFetch) {
    return allEventsFromFetch.filter((event) => {
        return isEventImportant(event);
    });
}

function shouldIncludeEventBecauseAutherIsNotRepoOwner(eventType) {
    const isAuthorAlsoTheOwner = eventType.author_association === 'OWNER';

    return !isAuthorAlsoTheOwner;
}

function filterByAuthorAssociation(events) {
    const filteredEvents = events.filter((event) => {
        switch (event.type) {
            case 'PullRequestEvent':
            case 'PullRequestReviewEvent':
                return shouldIncludeEventBecauseAutherIsNotRepoOwner(event.payload.pull_request);
            case 'CommitCommentEvent':
            case 'IssueCommentEvent':
            case 'PullRequestReviewCommentEvent':
                return shouldIncludeEventBecauseAutherIsNotRepoOwner(event.payload.comment);
            case 'IssuesEvent':
                return shouldIncludeEventBecauseAutherIsNotRepoOwner(event.payload.issue);
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

function isContributionInTimeRange(createdAt, startMoment, endMoment) {
    const momentOfContribution = createLuxonDateTimeFromIso(createdAt, 'Etc/UTC');

    return (
        momentOfContribution.toMillis() >= startMoment.toMillis() &&
        momentOfContribution.toMillis() < endMoment.toMillis()
    );
}

function didTheyQualify(idObject, dateTimes) {
    const startMoment = dateTimes[0];
    const endMoment = dateTimes[1];
    let numberOfQualifyingContributions = 0;

    for (let i = 0; i < idObject.contributions.length; i++) {
        const createdAtString = idObject.contributions[i].created_at;
        if (isContributionInTimeRange(createdAtString, startMoment, endMoment)) {
            numberOfQualifyingContributions++;
        }
        if (numberOfQualifyingContributions >= minimumNumberOfContributions) {
            return true;
        }
    }
}

function fetchUserDataAndAddToOutput(row, dateTimes) {
    const url = `https://api.github.com/users/${row[githubIdColumnNumber]}/events`;
    fetchPageOfDataAndFilter(url)
        .then((importantEvents) => {
            const idObject = createIdObject(row, importantEvents);
            if (didTheyQualify(idObject, dateTimes)) {
                process.stdout.write(`${idObject.alternateId}\n`);
            }
        })
        .catch((err) => {
            console.error('error', err);
        });
}

module.exports = {
    createIdObject,
    didTheyQualify,
    fetchPageOfDataAndFilter,
    fetchUserDataAndAddToOutput,
    filterResponseForImportantEvents,
    isContributionInTimeRange,
};
