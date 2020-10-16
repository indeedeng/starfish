const { expect } = require('chai');
const sinon = require('sinon');
const {
    createIdObject,
    fetchPageOfDataAndFilter,
    fetchUserDataAndAddToCSV,
    filterContributorByTime,
    filterResponseForImportantEvents,
    getOrThrow,
    parseDatesFromArgv,
} = require('../index');

const envBeforeChanges = Object.assign({}, process.env);

beforeEach(() => {
    process.env = Object.assign({}, envBeforeChanges);
});
after(() => {
    process.env = envBeforeChanges;
});
/* eslint-disable camelcase */
const mockedContributed = [
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
        expect(resultArray.length).to.equal(1);
        expect(resultArray[0].type).to.equal('IssueCommentEvent');
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
        expect(() => getOrThrow('configurationThatDoesNotExist')).to.throw(Error);
    });
    it('should return the value of a configuration that exists in the environment', () => {
        expect(() => getOrThrow('TIMEZONE')).not.to.throw(Error);
        expect(getOrThrow('TIMEZONE')).to.equal(process.env.TIMEZONE);
    });
});

describe('createIdObject', () => {
    it('should create a object id', () => {
        const returnObject = createIdObject(
            ['mockedUser', 'mockedUser@user.com'],
            mockedContributed
        );

        expect(returnObject.alternateId).to.equal('mockedUser@user.com');
        expect(returnObject.github).to.equal('mockedUser');

        const contributionsObject = [
            { id: '1', type: 'IssueCommentEvent' },
            { id: '2', type: 'PullRequestEvent' },
        ];

        contributionsObject.forEach((contribution, index) => {
            expect(returnObject.contributions[index].id).to.equal(contribution.id);
            expect(returnObject.contributions[index].type).to.equal(contribution.type);
        });
    });
});

describe('parseDatesFromArgv', () => {
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

    it('should generate 2 dates based on arguments', () => {
        const moments = parseDatesFromArgv();

        expect(`${moments[0]}`).to.equal('Wed Jan 01 2020 00:00:00 GMT-0800');
        expect(`${moments[1]}`).to.equal('Tue Dec 01 2020 23:59:59 GMT-0800');

        expect(`Users that contributed between ${moments[0]} and ${moments[1]}`).to.equal(
            'Users that contributed between Wed Jan 01 2020 00:00:00 GMT-0800 and Tue Dec 01 2020 23:59:59 GMT-0800'
        );
    });
});

describe('filterContributorByTime', () => {
    beforeEach(() => {
        process.env = {
            GITHUB_TOKEN: 'mockToken',
            TIMEZONE: 'America/Los_Angeles',
            CSV_COLUMN_NUMBER_FOR_GITHUB_ID: '0',
            CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: '1',
            GITHUB_IMPORTANT_EVENTS:
                'CommitCommentEvent,IssueCommentEvent,IssuesEvent,PullRequestEvent,PullRequestReviewEvent,PullRequestReviewCommentEvent',
        };

        process.argv[2] = '2020-01-02';
        process.argv[3] = '2020-12-01';
    });

    sinon.spy(console, 'log');

    it('must show the contributor email', () => {
        const idObject = createIdObject(['mockedUser', 'mockedUser@user.com'], mockedContributed);
        const moments = parseDatesFromArgv();

        filterContributorByTime(idObject, moments);

        expect(console.log.calledWith('mockedUser@user.com')).to.equal(true);
    });
});
