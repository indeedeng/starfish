// TODO: put timezone offset into env instead of it being a command line argument

// TODO: MAYBE** modularize out makeIdObject and MAYBE** make different paths for using LDAPs or not

/*
TO DECIDE:
- how best to handle the LDAP/no LDAP paths
- how best to handle CSV vs no CSV paths (my thought is that the CSV gets parsed in another file to have an array of github ids and the main code just uses an array of github ids)
- should the output of running this be a text file in a folder called result, or just a console.log?
- should we change the code to check first for time when looping through the user's events, and then filter by type, before continuing to go through the user's events in the github api. It would be more performant because we could break after we find one.
  This  one is related to the next one:
- should we add back in code to do other things, like get a user's contribs, or all users' contribs? And, if so, should they be their own completely separate files, or functions that can be called within this one (since we're already looping through the api), or what?
*/



require('dotenv').config()
const fetch = require('node-fetch');
const Moment = require('moment');
const {extendMoment} = require('moment-range');
const moment = extendMoment(Moment);
const parse = require('parse-link-header');

const env = require("./.env")

let arrayOfIdObjects = []; //LDAP plus GitHub Id
let clientID = process.env.CLIENT_ID;
let clientSecret = process.env.CLIENT_SECRET;

//parse CSV into JSON
let {Parser} = require('parse-csv');
let parser = new Parser();
let encoding = 'utf-8';
let csvData = "";

process.stdin.setEncoding(encoding);
process.stdin.on('readable', () => {
  let chunk;
  while (chunk = process.stdin.read()) {
    csvData += chunk;
  }
})
process.stdin.on('end', () => {
  let dates = parseDatesFromArgv();

  process.stdout.write(`Users that contributed between ${dates[0]} and ${dates[1]} `+ "\n")

  var datagrid = parser.parse(csvData).data;
  let arrayOfGithubIds = [];
  //detect duplicates, add user events, and send the the csv to stdout
  for(let i=1; i<datagrid.length; i++) {
    let currentRow = datagrid[i];
    let duplicateGithubId = false;
    for(let i=0; i<arrayOfGithubIds.length; i++) {
      if(arrayOfGithubIds[i]===currentRow[1]) {
        console.log("Duplicate GitHub ID- Erase From Google Sheet:", currentRow[1]);
        duplicateGithubId=true
        break;
      }
    }
    if(duplicateGithubId===true) {
      continue;
    }
    arrayOfGithubIds.push(currentRow[1]);
    let LDAP = parseLDAPfromEmail(currentRow);
    fetchUserDataAndAddToCSV(currentRow, LDAP, dates)
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

function parseLDAPfromEmail(row) {
  return row[4].slice(0, row[4].indexOf("@"))
}

function fetchUserDataAndAddToCSV(row, LDAP, dates) {
  let url = `https://api.github.com/users/${row[1]}/events?client_id=${clientID}&client_secret=${clientSecret}`
  fetchPageOfDataAndFilter(url).then(importantEvents => {
    let idObject = {};
    createIdObjects(row, LDAP, idObject, importantEvents);
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
        filterResponseForImportantEvents(json, importantEvents);
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

function filterResponseForImportantEvents(allEventsFromFetch, arrayOfImportantEvents) {
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
}

function createIdObjects(row, LDAP, idObject, importantEvents) {
  idObject.LDAP = LDAP;
  idObject.github = row[1];
  idObject.contributions = importantEvents;
  arrayOfIdObjects.push(idObject)
}

function filterContributorByTime(idObject, dates) {
  const timeWindow = moment.range([moment.utc(`${dates[0]}`, 'YYYY-MM-DD hh:mm'), moment.utc(`${dates[1]}`, 'YYYY-MM-DD hh:mm')]);
  const contribsByUser = [];
  for(let i=0; i<idObject.contributions.length; i++) {
    let contribDate = moment(idObject.contributions[i].created_at, "YYYY-MM-DD, h:mm:ss a")
    if(timeWindow.contains(contribDate)) {
      console.log(idObject.LDAP)
      break;
    }
  }
}


