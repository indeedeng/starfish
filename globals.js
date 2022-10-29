const { createLuxonDateTimeFromIso, createTimeZone } = require('./dateTimes');

function getOrThrowIfMissingOrEmpty(configField) {
    const value = process.env[configField];
    if (!value) {
        throw new Error(
            `${configField} is required. Please create a .env file, based off of the .env.template file, and ensure that all variables have values (no empty quotes)`
        );
    }

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
const githubIdColumnNumber = getOrThrowIfMissingOrEmpty('CSV_COLUMN_NUMBER_FOR_GITHUB_ID');
const alternateIdColumnNumber = getOrThrowIfMissingOrEmpty('CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID');
const minimumNumberOfContributions = process.env.MINIMUM_NUMBER_OF_CONTRIBUTIONS || 1;
const githubImportantEvents = getOrThrowIfMissingOrEmpty('GITHUB_IMPORTANT_EVENTS').split(',');
const timeZone = process.env.TIMEZONE;
const dateTimes = getDateTimesFromArgv(timeZone);
const csvFilename = process.argv[4];
const repositoriesToFilterOut = (process.env.IGNORE_REPOSITORIES || '')
    .split(',')
    .map((repo) => repo.trim());
const organizationsToFilterOut = (process.env.IGNORE_ORGANIZATIONS || '')
    .split(',')
    .map((repo) => repo.trim());

const ignoreSelfOwnedEvents = (process.env.IGNORE_SELFOWNED_EVENTS || 'false').toLowerCase();
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
    repositoriesToFilterOut,
    organizationsToFilterOut,
};
