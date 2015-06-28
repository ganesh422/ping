var express = require('express');
var router = express.Router();

/* GET ajax. */
router.get('/:file', function(req, res) {

    console.log('sent /images' + req.params.file);

    res.sendfile('/images' + req.params.file);

});

module.exports = router;
