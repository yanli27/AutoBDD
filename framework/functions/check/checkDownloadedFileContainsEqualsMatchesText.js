/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   fileName      File name
 * @param  {String}   rowNumber     at row/line number
 * @param  {String}   colNumber     at column number
 * @param  {String}   falseCase     not
 * @param  {String}   action        equals, contains or matches
 * @param  {String}   expectedText  The text to validate against
 */

const fs = require('fs');
const globSync = require("glob").sync;
const parseExpectedText = require('../common/parseExpectedText');
const getDownloadDir = require('../common/getDownloadDir');
const fs_session = require('../../libs/fs_session');

module.exports = (fileName, rowNumber, colNumber, falseCase, action, expectedText) => {
    const fileName_extSplit = fileName.split('.');
    const myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
    const myFileName = fileName_extSplit.join('.');
    const myFilePath = globSync(getDownloadDir() + myFileName + '.' + myFileExt)[0]; // we only process the first match
    var downloadFileContent, readTargetContent;

    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedExpectedText = parseExpectedText(expectedText);

    switch (myFileExt) {
        case 'pdf':
        case 'PDF':
            downloadFileContent = fs_session.readPdfData(myFilePath).text;
            if (rowNumber) {
                readTargetContent = downloadFileContent.split('\n')[rowNumber];
            } else {
                readTargetContent = downloadFileContent;
            }
            break;
        case 'xls':
        case 'XLS':
        case 'xlsx':
        case 'XLSX':
        case 'csv':
        case 'CSV':
            const xlsData = fs_session.readXlsData(myFilePath).filter(row => row.length > 0);
            if (rowNumber && colNumber) {
                readTargetContent = xlsData[rowNumber][colNumber].toString();
            } else if (rowNumber) {
                readTargetContent = xlsData[rowNumber].toString();
            } else{
                downloadFileContent = fs_session.readXlsData(myFilePath).toString();
                readTargetContent = downloadFileContent;
            }
            break;
        default:
            downloadFileContent = fs.readFileSync(myFilePath).toString();
            if (rowNumber) {
                readTargetContent = downloadFileContent.split('\n')[rowNumber];
            } else {
                readTargetContent = downloadFileContent;
            }        
    }

    /**
     * Whether to check if the content equals the given text or not
     * @type {Boolean}
     */
    let boolFalseCase = !!falseCase;

    // Check for empty element
    if (typeof parsedExpectedText === 'function') {
        parsedExpectedText = '';
        boolFalseCase = !boolFalseCase;
    }

    if (typeof parsedExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        parsedExpectedText = '';
        boolFalseCase = true;
    }

    if (boolFalseCase) {
        switch (action) {
            case 'contains':
                expect(readTargetContent).not.toContain(
                    parsedExpectedText,
                    `file "${fileName}" should not contain text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'equals':
                expect(readTargetContent).not.toEqual(
                    parsedExpectedText,
                    `file "${fileName}" should not equal text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'matches':
                expect(readTargetContent).not.toMatch(
                    parsedExpectedText,
                    `file "${fileName}" should not match text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    } else {
        switch (action) {
            case 'contains':
                expect(readTargetContent).toContain(
                    parsedExpectedText,
                    `file "${fileName}" should contain text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'equals':
                expect(readTargetContent).toEqual(
                    parsedExpectedText,
                    `file "${fileName}" should equal text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'matches':
                expect(readTargetContent).toMatch(
                    parsedExpectedText,
                    `file "${fileName}" should match text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}
