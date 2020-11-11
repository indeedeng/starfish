const { filterResponseForImportantEvents, getOrThrow } = require('../index');

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

describe('getOrThrow', () => {
    beforeEach(() => {
        process.env = {
            GITHUB_TOKEN: 'mockToken',
            TIMEZONE: 'America/Los_Angeles',
            CSV_COLUMN_NUMBER_FOR_GITHUB_ID: '0',
            CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: '1',
            GITHUB_IMPORTANT_EVENTS:
                'CommitCommentEvent,IssueCommentEvent,IssuesEvent,PullRequestEvent,PullRequestReviewEvent,PullRequestReviewCommentEvent',
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
