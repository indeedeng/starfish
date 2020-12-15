const { DateTime } = require('luxon');
const { createTimeZone } = require('..');

describe('createTimeZone', () => {
    let now;

    beforeEach(() => {
        now = DateTime.local();
    });

    it('should default to UTC', () => {
        const tzForUndefined = createTimeZone(undefined);
        const tzForEmpty = createTimeZone('');
        expect(tzForUndefined.offset(now.toMillis())).toEqual(0);
        expect(tzForEmpty.offset(now.toMillis())).toEqual(0);
    });

    it('should allow "local" as an identifier', () => {
        const localTz = createTimeZone('local');
        const localTzOffsetMillis = localTz.offset(now.toMillis());
        expect(localTzOffsetMillis).toEqual(now.offset);
    });
});
