const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// ----

const app = express();
const port = 3000;

// ----

const db = new sqlite3.Database('./data.db');

class load_setup {
    db_install() {
        db.serialize(function() {
            db.run('CREATE TABLE IF NOT EXISTS data (s_much LONGTEXT, s_why LONGTEXT, s_when LONGTEXT)');
        });
    }
}
const setup = new load_setup();
setup.db_install();

// ----

class load_tool {
    get_date() {
        let date = new Date();

        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDay();

        month = month.length !== 2 ? '0' + month : month
        day = day.length !== 2 ? '0' + day : day

        return year + '-' + month + '-' + day;
    }
}
const tool = new load_tool();

// ----

app.get('/', (req, res) => {
    db.serialize(function() {
        db.all('SELECT s_much, s_why, s_when FROM data', function(error, db_data) {
            let data = '<table>';
            data += '' +
                '<tr>' +
                    '<td>much</td>' +
                    '<td>why</td>' +
                    '<td>when</td>' +
                '<tr>' +
            '';

            for(let i in db_data) {
                data += '' +
                    '<tr>' +
                        '<td>' + db_data[i]['s_much'] + '</td>' +
                        '<td>' + db_data[i]['s_why'] + '</td>' +
                        '<td>' + db_data[i]['s_when'] + '</td>' +
                    '<tr>' +
                '';
            }

            data += '</table>'; 

            res.send(data);
        });
    });
})

app.listen(port, () => {
    console.log('Running... http://localhost:' + String(port));
})