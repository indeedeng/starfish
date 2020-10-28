const { filterResponseForImportantEvents, fetchPageOfDataAndFilter, createIdObject, getOrThrow } = require('../index');
const nock = require('nock');

const envBeforeChanges = Object.assign({}, process.env);
beforeEach(() => {
    process.env = Object.assign({}, envBeforeChanges);
});
afterAll(() => {
    process.env = envBeforeChanges;
});

describe('filterResponseForImportantEvents', () => {
    it('should return an array with the one important event', () => {
        var arrayofTwoEvents = [{ type: 'IssueCommentEvent' }, { type: 'Unimportant' }];
        let resultArray = filterResponseForImportantEvents(arrayofTwoEvents);
        expect(resultArray.length).toEqual(1);
        expect(resultArray[0].type).toEqual('IssueCommentEvent');
    });
});

describe('fetchPageOfDataAndFilter', () => {
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
    it('should resolve with list of important events', () => {
        nock('https://api.github.com')
            .get('/test')
            .reply(200, [
                { type: 'CommitCommentEvent' },
                { type: 'NotImportantEvent' },
                { type: 'PullRequestReviewEvent' },
                { type: 'AnotherNotImportantEvent' }
            ]);
        expect(fetchPageOfDataAndFilter('https://api.github.com/test')).resolves.toEqual(
            expect.arrayContaining([
                { type: 'CommitCommentEvent' },
                { type: 'PullRequestReviewEvent' },
            ])
        );
    });
    it('should resolve with each important event of same type', () => {
        nock('https://api.github.com')
            .get('/test')
            .reply(200, [
                { type: 'PullRequestReviewEvent' },
                { type: 'PullRequestReviewEvent' },
                { type: 'PullRequestReviewEvent' },
                { type: 'PullRequestReviewEvent' }
            ]);
        expect(fetchPageOfDataAndFilter('https://api.github.com/test')).resolves.toHaveLength(4);
    });
    it('should resolve with empty list when no important events found', () => {
        nock('https://api.github.com')
            .get('/test')
            .reply(200, [
                { type: 'NotImportantEvent' },
                { type: 'AnotherNotImportantEvent' },
                { type: 'YetAnotherNotImportantEvent' }
            ]);
        expect(fetchPageOfDataAndFilter('https://api.github.com/test')).resolves.toHaveLength(0);
    });
});

describe('createIdObject', () => {
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
    it('should return a properly formatted id object', () => {
        const row = [123, 456, 789];
        const importantEvents = [
            { event: 1 },
            { event: 2 },
            { event: 3 }
        ];
        expect(createIdObject(row, importantEvents)).toEqual({
            alternateId: row[1],
            github: row[0],
            contributions: importantEvents
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
        expect(() => getOrThrow('configurationThatDoesNotExist')).toThrow(Error);
    });
    it('should return the value of a configuration that exists in the environment', () => {
        expect(() => getOrThrow('TIMEZONE')).not.toThrow(Error);
        expect(getOrThrow('TIMEZONE')).toEqual(process.env.TIMEZONE);
    });
});
