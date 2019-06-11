require('dotenv').config()
const fetch = require('node-fetch');
const Moment = require('moment');
const {extendMoment} = require('moment-range');
const moment = extendMoment(Moment);
const parse = require('parse-link-header');
const env = require("./.env")

let arrayOfIdObjects = []; // each IdObject contains the GitHub Id PLUS Alternate Id for an individual (examples of alternate ids: an LDAP or company email- however your company identifies employees)
const githubClientID = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubIdColumnNumber = process.env.CSV_COLUMN_NUMBER_FOR_GITHUB_ID
const alternateIdColumnNumber = process.env.CSV_COLUMN_NUMBER_FOR_ALTERNATE_ID


//parse CSV into JSON
const {Parser} = require('parse-csv');
const parser = new Parser();
const encoding = 'utf-8';
let csvData = "";

process.stdin.setEncoding(encoding);
process.stdin.on('readable', () => {
  let chunk;
  while (chunk = process.stdin.read()) {
    csvData += chunk;
  }
})
process.stdin.on('end', () => {
  const dates = parseDatesFromArgv();

  process.stdout.write(`Users that contributed between ${dates[0]} and ${dates[1]} `+ "\n")

  var datagrid = parser.parse(csvData).data;
  let arrayOfGithubIds = [];
  //detect duplicates, add user events, and send the the csv to stdout
  for(let i=1; i<datagrid.length; i++) {
    let currentRow = datagrid[i];
    let duplicateGithubId = false;
    for(let i=0; i<arrayOfGithubIds.length; i++) {
      if(arrayOfGithubIds[i]===currentRow[1]) {
        console.log("Ignoring Duplicate GitHub ID- you should probably erase one instance of this github id from your CSV:", currentRow[1]);
        duplicateGithubId=true
        break;
      }
    }
    if(duplicateGithubId===true) {
      continue;
    }
    arrayOfGithubIds.push(currentRow[1]);
    fetchUserDataAndAddToCSV(currentRow, dates)
  }
});

//Helper Functions
function parseDatesFromArgv() {
  let startDate;
  let endDate;
  if(process.env.TIMEZONE_OFFSET) {
    startDate = process.argv[2] + " " + process.env.TIMEZONE_OFFSET;
    endDate = process.argv[3] + " " + process.env.TIMEZONE_OFFSET;
  } else {
    startDate = process.argv[2];
    endDate = process.argv[3];
  }
  return [startDate, endDate]
}

function fetchUserDataAndAddToCSV(row, dates) {
  let url = `https://api.github.com/users/${row[1]}/events?client_id=${githubClientID}&client_secret=${githubClientSecret}`
  fetchPageOfDataAndFilter(url).then(importantEvents => {
    let idObject = {};
    createIdObjects(row, idObject, importantEvents);
    filterContributorByTime(idObject, dates)
  }).catch(err => {console.log("error", err);})
}

function fetchPageOfDataAndFilter(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
    .then((response, err) => {
      let parsed = parse(response.headers.get('link'));
      let importantEvents = [];
      response.json()
      .then((json, err) => {
        let filteredForImportant = filterResponseForImportantEvents(json);
        importantEvents = importantEvents.concat(filteredForImportant);
        if (parsed && parsed.next && parsed.next.url) {
          fetchPageOfDataAndFilter(parsed.next.url).then(newEvents => {
            return resolve(importantEvents.concat(newEvents));
          });
        } else {
          return resolve(importantEvents);
        }
      })
      .catch(err => {console.log("Error turning response into JSON:", err);})
    })
    .catch(err => console.log("ERROR GRABBING INFO FROM GITHUB!", err))
  });
}

function filterResponseForImportantEvents(allEventsFromFetch) {
  let arrayOfImportantEvents = [];
  for(let i=0; i<allEventsFromFetch.length; i++) {
    let event = allEventsFromFetch[i];
    switch(event.type) {
      case 'CommitCommentEvent':
      case 'IssueCommentEvent':
      case 'IssuesEvent':
      case 'PullRequestEvent':
      case 'PullRequestReviewEvent':
      case 'PullRequestReviewCommentEvent':
        arrayOfImportantEvents.push(event);
        break;
    }
  }
  return arrayOfImportantEvents
}

function createIdObjects(row, idObject, importantEvents) {
  idObject.alternateId = row[alternateIdColumnNumber];
  idObject.github = row[githubIdColumnNumber];
  idObject.contributions = importantEvents;
  arrayOfIdObjects.push(idObject)
}

function filterContributorByTime(idObject, dates) {
  const timeWindow = moment.range([moment.utc(`${dates[0]}`, 'YYYY-MM-DD hh:mm'), moment.utc(`${dates[1]}`, 'YYYY-MM-DD hh:mm')]);
  const contribsByUser = [];
  for(let i=0; i<idObject.contributions.length; i++) {
    let contribDate = moment(idObject.contributions[i].created_at, "YYYY-MM-DD, h:mm:ss a")
    if(timeWindow.contains(contribDate)) {
      console.log(idObject.alternateId)
      break;
    }
  }
}

module.exports = filterResponseForImportantEvents
