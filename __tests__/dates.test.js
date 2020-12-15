const { DateTime } = require('luxon');
const { createTimeZone } = require('..');

const oneHourInMinutes = 60;

describe('createTimeZone', () => {
    let localNow;
    let nowMillis;

    beforeEach(() => {
        localNow = DateTime.local();
        nowMillis = localNow.toMillis();
    });

    it('should default to UTC', () => {
        const tzForUndefined = createTimeZone(undefined);
        const tzForEmpty = createTimeZone('');
        expect(tzForUndefined.offset(nowMillis)).toEqual(0);
        expect(tzForEmpty.offset(nowMillis)).toEqual(0);
    });

    it('should allow "local" as an identifier', () => {
        const localTz = createTimeZone('local');
        const localTzOffsetMillis = localTz.offset(nowMillis);
        expect(localTzOffsetMillis).toEqual(localNow.offset);
    });

    it('should allow a legal timezone identifier', () => {
        const ramsesTz = createTimeZone('Etc/GMT+6');
        expect(ramsesTz.offset(nowMillis)).toEqual(-6 * oneHourInMinutes);
    });

    it('should throw for an illegal timezone identifier', () => {
        expect(() => {
            createTimeZone('illegal');
        }).toThrow();
    });
});
