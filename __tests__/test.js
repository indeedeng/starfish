const sinon = require('sinon');
const {
    filterResponseForImportantEvents,
    fetchPageOfDataAndFilter,
    createIdObject,
    getOrThrow,
    parseDatesFromArgv,
    filterContributorByTime,
} = require('../index');
const nock = require('nock');

const envBeforeChanges = Object.assign({}, process.env);

beforeEach(() => {
    process.env = {
        GITHUB_TOKEN: 'mockToken',
        TIMEZONE: 'America/Los_Angeles',
        CSV_COLUMN_NUMBER_FOR_GITHUB_ID: '0',
        CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: '1',
        GITHUB_IMPORTANT_EVENTS:
            'CommitCommentEvent,IssueCommentEvent,IssuesEvent,PullRequestEvent,PullRequestReviewEvent,PullRequestReviewCommentEvent',
    };

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
/* eslint-enable camelcase */

describe('filterResponseForImportantEvents', () => {
    it('should return an array with the one important event', () => {
        var arrayofTwoEvents = [{ type: 'IssueCommentEvent' }, { type: 'Unimportant' }];
        let resultArray = filterResponseForImportantEvents(arrayofTwoEvents);
        expect(resultArray.length).toEqual(1);
        expect(resultArray[0].type).toEqual('IssueCommentEvent');
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

describe('getOrThrow', () => {
    it('should throw an error if the configuration does not exist in the environment', () => {
        expect(() => getOrThrow('configurationThatDoesNotExist')).toThrow(Error);
    });
    it('should return the value of a configuration that exists in the environment', () => {
        expect(() => getOrThrow('TIMEZONE')).not.toThrow(Error);
        expect(getOrThrow('TIMEZONE')).toEqual(process.env.TIMEZONE);
    });
});

describe('createIdObject', () => {
    it('should create a object id', () => {
        const mockedRow = ['mockedUser', 'mockedUser@user.com'];
        const returnObject = createIdObject(mockedRow, mockedEvents);

        expect(returnObject.alternateId).toEqual(
            mockedRow[process.env.CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID]
        );
        expect(returnObject.github).toEqual(mockedRow[process.env.CSV_COLUMN_NUMBER_FOR_GITHUB_ID]);

        const contributionsObject = [
            { id: '1', type: 'IssueCommentEvent' },
            { id: '2', type: 'PullRequestEvent' },
        ];

        contributionsObject.forEach((contribution, index) => {
            expect(returnObject.contributions[index].id).toEqual(contribution.id);
            expect(returnObject.contributions[index].type).toEqual(contribution.type);
        });
    });
});

describe('parseDatesFromArgv', () => {
    it('should generate 2 dates based on arguments', () => {
        const moments = parseDatesFromArgv();

        expect(`${moments[0]}`).toEqual('Wed Jan 01 2020 00:00:00 GMT-0800');
        expect(`${moments[1]}`).toEqual('Tue Dec 01 2020 23:59:59 GMT-0800');

        expect(`Users that contributed between ${moments[0]} and ${moments[1]}`).toEqual(
            'Users that contributed between Wed Jan 01 2020 00:00:00 GMT-0800 and Tue Dec 01 2020 23:59:59 GMT-0800'
        );
    });
});

describe('filterContributorByTime', () => {
    sinon.spy(console, 'log');

    it('must show the contributor email', () => {
        const idObject = createIdObject(['mockedUser', 'mockedUser@user.com'], mockedEvents);
        const moments = parseDatesFromArgv();

        filterContributorByTime(idObject, moments);

        expect(console.log.calledWith('mockedUser@user.com')).toEqual(true);
    });
});
