const {
    filterResponseForImportantEvents,
    fetchPageOfDataAndFilter,
    createIdObject,
    getOrThrow,
} = require('../index');
const nock = require('nock');

describe('filterResponseForImportantEvents', () => {
    it('should return an array with the one important event', () => {
        var arrayofTwoEvents = [{ type: 'IssueCommentEvent' }, { type: 'Unimportant' }];
        let resultArray = filterResponseForImportantEvents(arrayofTwoEvents);
        expect(resultArray.length).toEqual(1);
        expect(resultArray[0].type).toEqual('IssueCommentEvent');
    });
});

describe('getOrThrow', () => {
    it('should throw an error if the configuration does not exist in the environment', () => {
        expect(() => getOrThrow('configurationThatDoesNotExist')).toThrow(Error);
    });
    it('should return the value of a configuration that exists in the environment', () => {
        expect(() => getOrThrow('TIMEZONE')).not.toThrow(Error);
        expect(getOrThrow('TIMEZONE')).toEqual(process.env.TIMEZONE);
    });
});

describe('fetchPageOfDataAndFilter', () => {
    const apiDomain = 'https://api.github.com';
    const apiPath = '/users/octocat/events';
    const apiUrl = `${apiDomain}${apiPath}`;
    const importantEvents = process.env.GITHUB_IMPORTANT_EVENTS.split(',');
    it('should resolve with list of important events', () => {
        nock(apiDomain)
            .get(apiPath)
            .reply(200, [
                { type: importantEvents[0] },
                { type: 'NotImportantEvent' },
                { type: importantEvents[1] },
                { type: 'AnotherNotImportantEvent' },
            ]);
        expect(fetchPageOfDataAndFilter(apiUrl)).resolves.toEqual(
            expect.arrayContaining([{ type: importantEvents[0] }, { type: importantEvents[1] }])
        );
    });
    it('should resolve important events of same type', () => {
        nock(apiDomain)
            .get(apiPath)
            .reply(200, Array(4).fill({ type: importantEvents[0] }));
        expect(fetchPageOfDataAndFilter(apiUrl)).resolves.toHaveLength(4);
    });
    it('should resolve with empty list when no important events found', () => {
        nock(apiDomain)
            .get(apiPath)
            .reply(200, [
                { type: 'NotImportantEvent' },
                { type: 'AnotherNotImportantEvent' },
                { type: 'YetAnotherNotImportantEvent' },
            ]);
        expect(fetchPageOfDataAndFilter(apiUrl)).resolves.toHaveLength(0);
    });
});

describe('createIdObject', () => {
    it('should return a properly formatted id object', () => {
        const row = ['danisyellis', 'octocat', 'user-01'];
        const importantEvents = [
            { type: 'ImportantEvent1' },
            { type: 'ImportantEvent2' },
            { type: 'ImportantEvent3' },
        ];
        expect(createIdObject(row, importantEvents)).toEqual({
            alternateId: row[process.env.CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID],
            github: row[process.env.CSV_COLUMN_NUMBER_FOR_GITHUB_ID],
            contributions: importantEvents,
        });
    });
});
