function convertStringToNumber(degreeAsString) {
    if (degreeAsString.indexOf('-') > -1) {
        if (degreeAsString[0] === '-') {
            return 0.5;
        }
        return parseInt(degreeAsString[0]) + 0.5;
    } else {
        return parseInt(degreeAsString);
    }
}

module.exports = {
    convertStringToNumber,
}