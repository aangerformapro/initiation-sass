const
    express = require("express"),
    app = express(),
    port = process.env.PORT || 8000,
    path = require('node:path');

app.use(express.static('public'));

//put routes there


app.listen(port, () => {
    console.log('Server ' + path.basename(path.resolve()) + ' listening on port ' + port, 'http://127.0.0.1:' + port + '/');
});