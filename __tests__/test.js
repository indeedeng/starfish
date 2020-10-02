const { expect } = require('chai');
const {
    createIdObjects,
    fetchPageOfDataAndFilter,
    fetchUserDataAndAddToCSV,
    filterContributorByTime,
    filterResponseForImportantEvents,
    getOrThrow,
    parseDatesFromArgv,
} = require('../index');

const env = Object.assign({}, process.env);
beforeEach(() => {
    process.env = Object.assign({}, env);
});
afterAll(() => {
    process.env = env;
})

describe('filterResponseForImportantEvents', () => {
    it('should return an array with the one important event', () => {
        var arrayofTwoEvents = [{ type: 'IssueCommentEvent' }, { type: 'Unimportant' }];
        let resultArray = filterResponseForImportantEvents(arrayofTwoEvents);
        expect(resultArray.length).to.equal(1);
        expect(resultArray[0].type).to.equal('IssueCommentEvent');
    });
});
describe('getOrThrow', () => {
    beforeEach(() => {
        process.env = {
            GITHUB_TOKEN: 'mockToken',
            TIMEZONE:'America/Los_Angeles',
            CSV_COLUMN_NUMBER_FOR_GITHUB_ID: '0',
            CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: '1',
            GITHUB_IMPORTANT_EVENTS: 'CommitCommentEvent,IssueCommentEvent,IssuesEvent,PullRequestEvent,PullRequestReviewEvent,PullRequestReviewCommentEvent',
        }
    });
    it('should throw an error if the configuration does not exist in the environment', () => {
        expect(() => getOrThrow('configurationThatDoesNotExist')).to.throw(Error);
    })
    it('should return the value of a configuration that exists exists', () => {
        expect(() => getOrThrow('TIMEZONE')).not.to.throw(Error);
        expect(getOrThrow('TIMEZONE')).to.equal(process.env.TIMEZONE);
    })
})
