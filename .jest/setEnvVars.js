process.env.GITHUB_TOKEN = 'mock_token';
process.env.TIMEZONE = 'America/Los_Angeles';
process.env.CSV_COLUMN_NUMBER_FOR_GITHUB_ID = '0';
process.env.CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID = '1';
process.env.IGNORE_SELFOWNED_EVENTS = 'false';
process.env.MINIMUM_NUMBER_OF_CONTRIBUTIONS = 1;
process.env.GITHUB_IMPORTANT_EVENTS =
    'CommitCommentEvent,IssueCommentEvent,IssuesEvent,PullRequestEvent,PullRequestReviewEvent,PullRequestReviewCommentEvent';
