var expect = require('chai').expect;

console.log(5);
let filterResponseForImportantEvents = require('./index');

describe('Testing filterResponseForImportantEvents', function () {
    it('should return an array with the one important event', function () {
        var arrayofTwoEvents = [{ type: 'IssueCommentEvent' }, { type: 'Unimportant' }];
        let resultArray = filterResponseForImportantEvents(arrayofTwoEvents);
        expect(resultArray.length).to.equal(1);
        expect(resultArray[0].type).to.equal('IssueCommentEvent');
    });
});
