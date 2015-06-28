var express = require('express');
var router = express.Router();
var jade = require('jade'),
    fs = require('fs');

/* GET ajax. */
router.get('/:directory/:file', function(req, res) {
    /*fs.readFile('/ajax' + req.query.file, 'utf8', function (err, data) {
        if (err) throw err;
        res.send(data);
    });*/

    console.log(JSON.stringify(req));

    console.log(req.params.file);
    fs.readFile(('ajax/' + req.params.directory + '/' + req.params.file), 'utf8', function (err, data) {
        if (err) throw err;
        res.send(data);
    });
});

module.exports = router;
