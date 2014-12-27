var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  //res.render('index', { title: 'Qi' });
  console.log('GET request for /  ::--> returned index.jade');
  res.render('index.jade', {"title": "Qi"});
});

module.exports = router;
