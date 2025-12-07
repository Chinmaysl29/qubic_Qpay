const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

const readDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        return { merchants: [], payments: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = { readDB, writeDB };
