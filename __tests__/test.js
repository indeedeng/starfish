const {
    getOrThrow,
    parseDatesFromArgv,
    filterResponseForImportantEvents,
    fetchPageOfDataAndFilter,
    createIdObject,
    didTheyQualify,
} = require('../index');
const nock = require('nock');

const envBeforeChanges = Object.assign({}, process.env);

beforeEach(() => {
    process.argv[2] = '2020-01-01';
    process.argv[3] = '2020-12-01';
});
afterAll(() => {
    process.env = envBeforeChanges;
});
/* eslint-disable camelcase */
const mockedEvents = [
    {
        id: '1',
        type: 'IssueCommentEvent',
        actor: {
            id: 43557983,
            login: 'mockedUser',
            display_login: 'mockedUser',
            gravatar_id: '',
            url: 'https://api.github.com/users/mockedUser',
            avatar_url: 'https://avatars.githubusercontent.com/u/mockedUser',
        },
        repo: {
            id: 189639372,
            name: 'indeedeng/starfish',
            url: 'https://api.github.com/repos/indeedeng/starfish',
        },
        payload: { action: 'created', issue: [Object], comment: [Object] },
        public: true,
        created_at: '2020-10-16T18:36:33Z',
        org: {
            id: 2905043,
            login: 'indeedeng',
            gravatar_id: '',
            url: 'https://api.github.com/orgs/indeedeng',
            avatar_url: 'https://avatars.githubusercontent.com/u/2905043?',
        },
    },
    {
        id: '2',
        type: 'PullRequestEvent',
        actor: {
            id: 4355712983,
            login: 'mockedUser',
            display_login: 'mockedUser',
            gravatar_id: '',
            url: 'https://api.github.com/users/mockedUser',
            avatar_url: 'https://avatars.githubusercontent.com/u/mockedUser',
        },
        repo: {
            id: 189612339372,
            name: 'indeedeng/starfish',
            url: 'https://api.github.com/repos/indeedeng/starfish',
        },
        payload: { action: 'created', issue: [Object], comment: [Object] },
        public: true,
        created_at: '2020-09-16T18:36:33Z',
        org: {
            id: 2905012343,
            login: 'indeedeng',
            gravatar_id: '',
            url: 'https://api.github.com/orgs/indeedeng',
            avatar_url: 'https://avatars.githubusercontent.com/u/2905043?',
        },
    },
];

const mockedEventsOutOfTimeRange = [
    {
        id: '3',
        type: 'PullRequestEvent',
        actor: {
            id: 4355712984,
            login: 'earlyUser',
            display_login: 'madeEventNotInTimeRange',
            gravatar_id: '',
            url: 'https://api.github.com/users/earlyUser',
            avatar_url: 'https://avatars.githubusercontent.com/u/earlyUser',
        },
        repo: {
            id: 189612339372,
            name: 'indeedeng/starfish',
            url: 'https://api.github.com/repos/indeedeng/starfish',
        },
        payload: { action: 'created', issue: [Object], comment: [Object] },
        public: true,
        created_at: '2019-01-01T18:36:33Z',
        org: {
            id: 2905012343,
            login: 'indeedeng',
            gravatar_id: '',
            url: 'https://api.github.com/orgs/indeedeng',
            avatar_url: 'https://avatars.githubusercontent.com/u/2905043?',
        },
    },
    {
        id: '4',
        type: 'PullRequestEvent',
        actor: {
            id: 4355712985,
            login: 'earlyUser',
            display_login: 'madeEventNotInTimeRange',
            gravatar_id: '',
            url: 'https://api.github.com/users/earlyUser',
            avatar_url: 'https://avatars.githubusercontent.com/u/earlyUser',
        },
        repo: {
            id: 189612339372,
            name: 'indeedeng/starfish',
            url: 'https://api.github.com/repos/indeedeng/starfish',
        },
        payload: { action: 'created', issue: [Object], comment: [Object] },
        public: true,
        created_at: '2019-01-02T18:36:33Z',
        org: {
            id: 2905012343,
            login: 'indeedeng',
            gravatar_id: '',
            url: 'https://api.github.com/orgs/indeedeng',
            avatar_url: 'https://avatars.githubusercontent.com/u/2905043?',
        },
    },
];
/* eslint-enable camelcase */

describe('getOrThrow', () => {
    it('should throw an error if the configuration does not exist in the environment', () => {
        expect(() => getOrThrow('configurationThatDoesNotExist')).toThrow(Error);
    });
    it('should return the value of a configuration that exists in the environment', () => {
        expect(() => getOrThrow('TIMEZONE')).not.toThrow(Error);
        expect(getOrThrow('TIMEZONE')).toEqual(process.env.TIMEZONE);
    });
});

describe('parseDatesFromArgv', () => {
    it('should generate 2 dates based on arguments', () => {
        const testdateString1 = '2020-01-01T00:00:00.000-08:00';
        const testdateString2 = '2020-12-01T23:59:59.999-08:00';

        const moments = parseDatesFromArgv();

        expect(`${moments[0]}`).toEqual(`${testdateString1}`);
        expect(`${moments[1]}`).toEqual(`${testdateString2}`);
    });
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
    it('should create an idObject', () => {
        const mockedRow = ['mockedUser', 'mockedUser@user.com'];
        const returnObject = createIdObject(mockedRow, mockedEvents);

        expect(returnObject.alternateId).toEqual(
            mockedRow[process.env.CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID]
        );
        expect(returnObject.github).toEqual(mockedRow[process.env.CSV_COLUMN_NUMBER_FOR_GITHUB_ID]);

        const contributionObjects = [
            { id: mockedEvents[0].id, type: mockedEvents[0].type },
            { id: mockedEvents[1].id, type: mockedEvents[1].type },
        ];

        contributionObjects.forEach((contribution, index) => {
            expect(returnObject.contributions[index].id).toEqual(contribution.id);
            expect(returnObject.contributions[index].type).toEqual(contribution.type);
        });
    });
});

describe('didTheyQualify', () => {
    it('returns true if two contributions are within the time range and the minimum number of contributions is 2', () => {
        const idObject = createIdObject(['mockedUser', 'mockedUser@user.com'], mockedEvents);
        const moments = parseDatesFromArgv();
        expect(didTheyQualify(idObject, moments)).toBeTruthy();
    });
    it('returns false if there is only 1 valid contribution, minimum number of contributions is higher than 1', () => {
        const idObject = createIdObject(['mockedUser', 'mockedUser@user.com'], mockedEvents[0]);
        const moments = parseDatesFromArgv();
        expect(didTheyQualify(idObject, moments)).toBeFalsy();
    });
    it('returns false if the two dates of the contribution are not within the date range', () => {
        const idObject = createIdObject(
            ['earlyUser', 'madeEventNotInTimeRange@user.com'],
            mockedEventsOutOfTimeRange
        );
        const moments = parseDatesFromArgv();
        expect(didTheyQualify(idObject, moments)).toBeFalsy();
    });
});
