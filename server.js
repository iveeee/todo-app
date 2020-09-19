let express = require('express');
let mongodb = require('mongodb');
let sanitizeHTML = require('sanitize-html')

let app = express();
let db;

let port = process.env.PORT;
if (port == null || port == "") port = 3000;

app.use(express.static('public'));

let connectionString = 'mongodb+srv://admin:adminTorres@cluster0.4fjeg.mongodb.net/TodoApp?retryWrites=true&w=majority';
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    db = client.db();
    app.listen(3000)
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));

function passwordProtected(req, resp, next) {
    resp.set('WWW-Authenticate', 'Basic realm="Simple Todo App"');
    console.log(req.headers.authorization);
    if (req.headers.authorization == 'Basic dGVzdHVzZXI6cEBzc3cwcmQ=') {
        next()
    } else {
        resp.status(401).send("Authentication required");
    }
}

app.use(passwordProtected)

app.get('/', (req, resp) => {
    db.collection('items').find().toArray((err, items) => {
        resp.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Simple To-Do App</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
            </head>
            <body>
                <div class="container">
                    <h1 class="display-4 text-center py-1">To-Do App</h1>
                    
                    <div class="jumbotron p-3 shadow-sm">
                    <form id="create-form" action="/add-item" method="POST">
                        <div class="d-flex align-items-center">
                        <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                        <button class="btn btn-primary">Add New Item</button>
                        </div>
                    </form>
                    </div>
                    
                    <ul id="item-list" class="list-group pb-5"></ul>
                </div>
                
                <script>
                    let items = ${JSON.stringify(items)};
                </script>
                <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
                <script src="/browser.js"></script>
            </body>
            </html>
        `);
    });
});

function safeText(text) {
    return sanitizeHTML(text, {allowedTags: [], allowedAttributes: {}});
}

app.post("/add-item", (req, resp) => {
    db.collection('items').insertOne({item: safeText(req.body.item)}, (err, info) => {
        resp.json(info.ops[0]);
    });
});

app.post("/update-item", (req, resp) => {
    db.collection('items')
        .findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {item: safeText(req.body.item)}}, 
        () => resp.send('Success'));
});

app.post("/delete-item", (req, resp) => {
    db.collection('items')
        .deleteOne({_id: new mongodb.ObjectId(req.body.id)}, () => resp.send('Success'));
});
