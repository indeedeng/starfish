require("dotenv").config();

const fetch = require("node-fetch");
const Moment = require("moment");
const { extendMoment } = require("moment-range");
const moment = extendMoment(Moment);
const parse = require("parse-link-header");
const env = require("./.env");

const arrayOfIdObjects = []; // each IdObject contains the GitHub Id PLUS Alternate Id for an individual (examples of alternate ids: an LDAP or company email- however your company identifies employees)
const {
  CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID: alternateIdColumnNumber,
  CSV_COLUMN_NUMBER_FOR_GITHUB_ID: githubIdColumnNumber,
  GITHUB_CLIENT_ID: githubClientID,
  GITHUB_CLIENT_SECRET: githubClientSecret
} = process.env;

//parse CSV into JSON
const { Parser } = require("parse-csv");
const parser = new Parser();
const encoding = "utf-8";
let csvData = "";

process.stdin.setEncoding(encoding);
process.stdin.on("readable", () => {
  let chunk;
  while ((chunk = process.stdin.read())) {
    csvData += chunk;
  }
});
process.stdin.on("end", () => {
  const dates = parseDatesFromArgv();

  process.stdout.write(
    `Users that contributed between ${dates[0]} and ${dates[1]} ` + "\n"
  );

  const datagrid = parser.parse(csvData).data;
  const githubIds = new Set([]);
  //detect duplicates, add user events, and send the csv to stdout
  for (let i = 1; i < datagrid.length; i++) {
    const [, currentId] = datagrid[i];

    if (githubIds.has(currentId)) {
      console.log(
        "Ignoring Duplicate GitHub ID- you should probably erase one instance of this github id from your CSV:",
        currentId
      );
      continue;
    }

    githubIds.add(currentId);
    fetchUserDataAndAddToCSV(datagrid[i], dates);
  }
});

//Helper Functions
function parseDatesFromArgv() {
  const {
    argv,
    env: { TIMEZONE_OFFSET }
  } = process;
  const offset = TIMEZONE_OFFSET ? ` ${TIMEZONE_OFFSET}` : "";
  const startDate = `${argv[2]}${offset}`;
  const endDate = `${argv[3]}${offset}`;

  return [startDate, endDate];
}

function fetchUserDataAndAddToCSV(row, dates) {
  const url = `https://api.github.com/users/${
    row[1]
  }/events?client_id=${githubClientID}&client_secret=${githubClientSecret}`;
  fetchPageOfDataAndFilter(url)
    .then(importantEvents => {
      const idObject = {};
      createIdObjects(row, idObject, importantEvents);
      filterContributorByTime(idObject, dates);
    })
    .catch(err => {
      console.log("error", err);
    });
}

function fetchPageOfDataAndFilter(url) {
  return new Promise(resolve => {
    fetch(url)
      .then(response => {
        const parsed = parse(response.headers.get("link"));
        let importantEvents = [];
        response
          .json()
          .then(json => {
            const filteredForImportant = filterResponseForImportantEvents(json);
            importantEvents = importantEvents.concat(filteredForImportant);

            if (!(parsed && parsed.next && parsed.next.url)) {
              return resolve(importantEvents);
            }

            fetchPageOfDataAndFilter(parsed.next.url).then(newEvents =>
              resolve(importantEvents.concat(newEvents))
            );
          })
          .catch(err => {
            console.log("Error turning response into JSON:", err);
          });
      })
      .catch(err => console.log("ERROR GRABBING INFO FROM GITHUB!", err));
  });
}

const importantEventTypes = [
  "CommitCommentEvent",
  "IssueCommentEvent",
  "IssuesEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
  "PullRequestReviewCommentEvent"
];

function filterResponseForImportantEvents(allEventsFromFetch) {
  const arrayOfImportantEvents = [];
  for (let i = 0; i < allEventsFromFetch.length; i++) {
    const event = allEventsFromFetch[i];
    if (importantEventTypes.includes(event.type)) {
      arrayOfImportantEvents.push(event);
    }
  }
  return arrayOfImportantEvents;
}

function createIdObjects(row, idObject, importantEvents) {
  idObject.alternateId = row[alternateIdColumnNumber];
  idObject.github = row[githubIdColumnNumber];
  idObject.contributions = importantEvents;
  arrayOfIdObjects.push(idObject);
}

function filterContributorByTime(idObject, dates) {
  const timeWindow = moment.range([
    moment.utc(`${dates[0]}`, "YYYY-MM-DD hh:mm"),
    moment.utc(`${dates[1]}`, "YYYY-MM-DD hh:mm")
  ]);
  const contribsByUser = [];
  for (let i = 0; i < idObject.contributions.length; i++) {
    const contribDate = moment(
      idObject.contributions[i].created_at,
      "YYYY-MM-DD, h:mm:ss a"
    );
    if (timeWindow.contains(contribDate)) {
      console.log(idObject.alternateId);
      break;
    }
  }
}

module.exports = filterResponseForImportantEvents;
