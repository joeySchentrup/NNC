var express = require('express');
var formidable = require('formidable');
var cpy = require('cpy');
var path = require('path');
var cmd = require('node-cmd');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/main', function(req, res, next) {
  res.render('main');
});

router.post('/uploadfile', function(req, res, next) {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.send(500);
    }

    if(files.image.size !== 0) {
      let filename = "fileToAnalyze.jpg";
      let linkPath = path.normalize(path.join(__dirname, '../'));
      cpy([files.image.path], linkPath, {
        rename: filename
      }).then(() => {
        cmd.get(
          'python3 "modelTest.py"',
          (err, data, stderr) => {
            console.log(data)
            res.render('result', {isDeer: parseInt(data) ? 'Deer!' : 'No deer!'});
          }
        )
      }, (err) => {
        console.log(`ERROR: ${err}`);
        res.sendStatus(500);
      });
    }
  });
});

module.exports = router;
