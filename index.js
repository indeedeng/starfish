require('dotenv').config();
const { createTimeZone } = require('./dateTimes');
const fs = require('fs');
const { csvFilename, githubIdColumnNumber, timeZone, dateTimes } = require('./globals');
const { DateTime } = require('luxon');
const { Parser } = require('parse-csv');
const { fetchUserDataAndAddToOutput } = require('./starfish');

function parseCsvData() {
    const parser = new Parser();
    const zone = createTimeZone(timeZone);
    const localStart = dateTimes[0].setZone(zone).toLocaleString(DateTime.DATETIME_FULL);
    const localEnd = dateTimes[1].setZone(zone).toLocaleString(DateTime.DATETIME_FULL);
    console.info(`Users that contributed between ${localStart} and ${localEnd}`);

    const csvData = fs.readFileSync(csvFilename, { encoding: 'utf8' });
    const datagrid = parser.parse(csvData).data;

    return datagrid;
}

function runStarfish() {
    const datagridOfPotentialContributorsInfo = parseCsvData();
    const uniqueIds = new Set();
    for (let rowNumber = 1; rowNumber < datagridOfPotentialContributorsInfo.length; rowNumber++) {
        const currentRow = datagridOfPotentialContributorsInfo[rowNumber];
        const currentId = currentRow[githubIdColumnNumber];
        if (uniqueIds.has(currentId)) {
            console.info(
                `Ignoring Duplicate GitHub ID- you should probably erase one instance of this github id from your CSV: ${currentId}`
            );
        } else {
            uniqueIds.add(currentId);

            const delayToAvoidOverwhelmingMacNetworkStack = rowNumber * 10;
            setTimeout(() => {
                fetchUserDataAndAddToOutput(currentRow, dateTimes);
            }, delayToAvoidOverwhelmingMacNetworkStack);
        }
    }
}

runStarfish();
