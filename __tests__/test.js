const { expect } = require('chai');
const nock = require('nock');
const {
    createIdObject,
    fetchPageOfDataAndFilter,
    fetchUserDataAndAddToCSV,
    filterContributorByTime,
    filterResponseForImportantEvents,
    getOrThrow,
    parseDatesFromArgv
} = require('../index');

const envBeforeChanges = Object.assign({}, process.env);
beforeEach(() => {
    process.env = Object.assign({}, envBeforeChanges);
});
after(() => {
    process.env = envBeforeChanges;
});

describe('filterResponseForImportantEvents', () => {
    it('should return an array with the one important event', () => {
        var arrayofTwoEvents = [{ type: 'IssueCommentEvent' }, { type: 'Unimportant' }];
        let resultArray = filterResponseForImportantEvents(arrayofTwoEvents);
        expect(resultArray.length).to.equal(1);
        expect(resultArray[0].type).to.equal('IssueCommentEvent');
    });
});

describe('fetchPageOfDataAndFilter', () => {
    beforeEach(() => {
        process.env = {
            GITHUB_TOKEN: 'mockToken',
            TIMEZONE: 'America/Los_Angeles',
            CSV_COLUMN_NUMBER_FOR_GITHUB_ID: '0',
            CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: '1',
            GITHUB_IMPORTANT_EVENTS: 'CommitCommentEvent,PullRequestReviewEvent',
        };
    });
    it('should throw an error if given an invalid url', (done) => {
        fetchPageOfDataAndFilter('this_is_error')
            .then(() => {
                expect.fail('fetchPageOfDataAndFilter should error when given invalid url');
                done();
            })
            .catch((e) => {
                expect(e.name).to.equal('TypeError');
                done();
            });
    });
    it('should throw an error if http response is an error', (done) => {
        nock('https://api.github.com')
            .get('/test')
            .reply(500);
        fetchPageOfDataAndFilter('https://api.github.com/test')
            .then(() => {
                expect.fail('fetchPageOfDataAndFilter should error when response status is not 200');
                done();
            })
            .catch((e) => {
                expect(e.name).to.equal('Error');
                done();
            });
    });
    it('should throw an error if http response has error when transforming to json', (done) => {
        nock('https://api.github.com')
            .get('/test')
            .reply(200);
        fetchPageOfDataAndFilter('https://api.github.com/test')
            .then(() => {
                expect.fail('fetchPageOfDataAndFilter should error when there is a fetch error');
                done();
            })
            .catch((e) => {
                expect(e.name).to.equal('FetchError');
                done();
            });
    });
    it('should output list of important events', (done) => {
        nock('https://api.github.com')
            .get('/test')
            .reply(200, [
                { type: 'CommitCommentEvent' },
                { type: 'NotImportantEvent' },
                { type: 'PullRequestReviewEvent' },
                { type: 'PullRequestReviewEvent' },
                { type: 'AnotherNotImportantEvent' },
            ]);
        fetchPageOfDataAndFilter('https://api.github.com/test')
            .then((res) => {
                expect(res).to.have.lengthOf(3);
                done();
            })
            .catch(() => {
                expect.fail('fetchPageOfDataAndFilter should not error with valid response');
                done();
            });
    });
});

describe('getOrThrow', () => {
    beforeEach(() => {
        process.env = {
            GITHUB_TOKEN: 'mockToken',
            TIMEZONE: 'America/Los_Angeles',
            CSV_COLUMN_NUMBER_FOR_GITHUB_ID: '0',
            CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: '1',
            GITHUB_IMPORTANT_EVENTS:
                'CommitCommentEvent,IssueCommentEvent,IssuesEvent,PullRequestEvent,PullRequestReviewEvent,PullRequestReviewCommentEvent'
        };
    });
    it('should throw an error if the configuration does not exist in the environment', () => {
        expect(() => getOrThrow('configurationThatDoesNotExist')).to.throw(Error);
    });
    it('should return the value of a configuration that exists in the environment', () => {
        expect(() => getOrThrow('TIMEZONE')).not.to.throw(Error);
        expect(getOrThrow('TIMEZONE')).to.equal(process.env.TIMEZONE);
    });
});
