const axios = require('axios');

async function getPreferences() {
    const roadsPrefPromise = axios('http://localhost:5000/database/favRoads');
    const roadsPref = (await roadsPrefPromise).data.value.favRoads;
    return roadsPref;
}

module.exports = getPreferences;