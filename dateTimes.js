const { DateTime, IANAZone, LocalZone } = require('luxon');

function createTimeZone(timeZoneIdentifier) {
    if (!timeZoneIdentifier || timeZoneIdentifier === '') {
        return IANAZone.create('UTC');
    }
    if (timeZoneIdentifier === 'local') {
        return LocalZone.instance;
    }
    if (IANAZone.isValidZone(timeZoneIdentifier)) {
        return IANAZone.create(timeZoneIdentifier);
    }
    const errorMessage = `Unknown time zone "${timeZoneIdentifier}". Fix the TIMEZONE entry of the .env file.`;
    throw new Error(errorMessage);
}

function createLuxonDateTimeFromIso(isoDateTimeString, timeZoneIdentifier) {
    const zone = createTimeZone(timeZoneIdentifier);

    const dateTime = DateTime.fromISO(isoDateTimeString, {
        zone,
    });

    return dateTime;
}

module.exports = { createTimeZone, createLuxonDateTimeFromIso };
