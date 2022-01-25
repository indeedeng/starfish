const { createLuxonDateTimeFromIso, createTimeZone } = require('./dateTimes');

const defaultEnvironmentVariables = {
    TIMEZONE: '',
    CSV_COLUMN_NUMBER_FOR_GITHUB_ID: '0',
    CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: '0',
    IGNORE_SELFOWNED_EVENTS: 'false',
    MINIMUM_NUMBER_OF_CONTRIBUTIONS: 1,
    GITHUB_IMPORTANT_EVENTS:
        'CommitCommentEvent,IssueCommentEvent,IssuesEvent,PullRequestEvent,PullRequestReviewEvent,PullRequestReviewCommentEvent',
};

function getOrThrowIfMissingOrEmpty(configField) {
    const value = process.env[configField];
    if (!value) {
        throw new Error(
            `${configField} is required. Please create a .env file, based off of the .env.template file, and ensure that all variables have values (no empty quotes)`
        );
    }

    return value;
}

function getDefaultEnvironemntValues(configField) {
    const environmentValue = process.env[configField];
    const value = environmentValue ? environmentValue : defaultEnvironmentVariables[configField];

    return value;
}

function getDateTimesFromArgv(timeZone) {
    console.info(`Using time zone: ${createTimeZone(timeZone).name}`);
    const startDate = process.argv[2];
    const endDate = process.argv[3];

    const startMoment = createLuxonDateTimeFromIso(startDate, timeZone).startOf('day');
    const endMoment = createLuxonDateTimeFromIso(endDate, timeZone).endOf('day');

    return [startMoment, endMoment];
}

const githubToken = Buffer.from(getOrThrowIfMissingOrEmpty('GITHUB_TOKEN')).toString('base64');
const githubIdColumnNumber = getDefaultEnvironemntValues('CSV_COLUMN_NUMBER_FOR_GITHUB_ID');
const alternateIdColumnNumber = getDefaultEnvironemntValues('CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID');
const minimumNumberOfContributions = getDefaultEnvironemntValues('MINIMUM_NUMBER_OF_CONTRIBUTIONS');
const githubImportantEvents = getDefaultEnvironemntValues('GITHUB_IMPORTANT_EVENTS').split(',');
const timeZone = getDefaultEnvironemntValues('TIMEZONE');
const dateTimes = getDateTimesFromArgv(timeZone);
const csvFilename = process.argv[4];

const ignoreSelfOwnedEvents = getDefaultEnvironemntValues('IGNORE_SELFOWNED_EVENTS').toLowerCase();
console.info(`Configuration set to ignore self-owned events? ${ignoreSelfOwnedEvents}`);
if (ignoreSelfOwnedEvents !== 'true' && ignoreSelfOwnedEvents !== 'false') {
    console.error('IGNORE_SELFOWNED_EVENTS must be "true" or "false"');
    process.exit(1);
}

module.exports = {
    alternateIdColumnNumber,
    csvFilename,
    dateTimes,
    getDateTimesFromArgv,
    getOrThrowIfMissingOrEmpty,
    githubIdColumnNumber,
    githubImportantEvents,
    githubToken,
    ignoreSelfOwnedEvents,
    minimumNumberOfContributions,
};
