const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const body_parser = require('body-parser');
const entity = require('html-entities').XmlEntities;

// ----

const app = express();
app.use(body_parser.urlencoded({ extended : true }));
app.use(body_parser.json());
const port = 3000;
const html_encode = new entity();

// ----

const db = new sqlite3.Database('./data.db');

class load_setup {
    db_install() {
        db.serialize(function() {
            db.run('CREATE TABLE IF NOT EXISTS data (s_much LONGTEXT, s_why LONGTEXT, s_when LONGTEXT, s_id LONGTEXT)');
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

    get_error(n = 1) {
        if(n === 1) {
            return 'num type error';
        } else if(n === 2) {
            return 'future error'
        } else {
            return 'just errpr';
        }
    }

    get_redirect(where = '/') {
        return '<meta http-equiv="refresh" content="0; url=' + where + '">';
    }
}
const tool = new load_tool();

// ----

app.get('/', (req, res) => {
    db.all('SELECT s_much, s_why, s_when, s_id FROM data ORDER BY s_when DESC', function(error, db_data) {
        let data = '<table>';
        data += '' +
            '<tr>' +
                '<td>much</td>' +
                '<td>why</td>' +
                '<td>when</td>' +
                '<td>tool</td>'
            '<tr>' +
        '';

        for(let i in db_data) {
            data += '' +
                '<tr>' +
                    '<td>' + db_data[i]['s_much'] + '</td>' +
                    '<td>' + html_encode.encode(db_data[i]['s_why']) + '</td>' +
                    '<td>' + db_data[i]['s_when'] + '</td>' +
                    '<td><a href="/remove/' + db_data[i]['s_id'] + '">(remove)</a></td>' +
                '<tr>' +
            '';
        }

        data += '' +
            '</table>' +
            '<a href="/add">(add)</a>' +
        ''

        res.send(data);
    });
});


app.get('/add', (req, res) => {
    res.send(
        '<form method="post">' +
            '<input name="much" placeholder="much (number only)">' +
            '<br>' +
            '<br>' +
            '<input name="why" placeholder="why">' +
            '<br>' +
            '<br>' +
            '<input name="when" placeholder="when (XXXX-XX-XX)">' +
            '<br>' +
            '<br>' +
            '<button type="summit">(send)</button>' +
        '</form>'
    );
});

app.post('/add', (req, res) => {
    console.log(req.body);
    let search_num = req.body['much'].match(/^[0-9]+$/);
    let search_date = req.body['when'].match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
    if(search_num && search_date) {
        let date_data = Number(tool.get_date().replace(/-/g, ''));
        let when_data = Number(req.body['when'].replace(/-/g, ''));
        if(date_data >= when_data) {
            db.all('SELECT s_id FROM data ORDER BY s_id + 0 DESC LIMIT 1', function(error, db_data) {
                let db_run = db.prepare("INSERT INTO data (s_much, s_why, s_when, s_id) VALUES (?, ?, ?, ?)");
                db_run.run([
                    req.body['much'],
                    req.body['why'],
                    req.body['when'],
                    db_data !== [] ? String(Number(db_data[0]['s_id']) + 1) : '1'
                ]);
                db_run.finalize();

                res.send(tool.get_redirect());
            });
        } else {
            res.send(tool.get_error(2));
        }
    } else {
        res.send(tool.get_error(1));
    }
});

app.get('/remove/:id', (req, res) => {
    db.all('SELECT s_id FROM data WHERE s_id = ?', [req.params['id']], function(error, db_data) {
        if(db_data.length !== 0) {
            res.send(
                '<form method="post">' +
                    '<button type="summit">(remove)</button>' +
                '</form>'
            );
        } else {
            res.send(tool.get_redirect());
        }
    });
});

app.post('/remove/:id', (req, res) => {
    db.all('SELECT s_id FROM data WHERE s_id = ?', [req.params['id']], function(error, db_data) {
        if(db_data.length !== 0) {
            let db_run = db.prepare("DELETE FROM data WHERE s_id = ?");
            db_run.run([req.params['id']]);
            db_run.finalize();

            res.send(tool.get_redirect());
        } else {
            res.send(tool.get_redirect());
        }
    });
});

app.listen(port, () => {
    console.log('Running... http://localhost:' + String(port));
})