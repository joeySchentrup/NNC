var express = require('express');
const child_process = require('child_process');
var formidable = require('formidable');
var cpy = require('cpy');
var path = require('path');
var cmd = require('node-cmd');
var router = express.Router();
var AdmZip = require('adm-zip');

const training_data = "../training_data"
const model_data = "../models/model.out"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/main', function(req, res, next) {
  res.render('main');
});

router.post('/testpicture', function(req, res, next) {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.send(500);
    }

    if(files.image.size !== 0) {
      let filename = "fileToAnalyze.jpg";
      let linkPath = path.normalize(path.join(__dirname, '../'));

      console.log("File received. Copying file...")
      cpy([files.image.path], linkPath, {
        rename: filename
      }).then(() => {

        console.log("Copied. Starting model...");
        const pythonProcess = child_process.spawn('python3', ["./predictor.py"]);
        
        console.log("Model done.");
        pythonProcess.stderr.on('data', (data) => {
          console.log(`Model error: ${data}`);
        });

        pythonProcess.stdout.on('data', (data) => {
          console.log(`Model output: ${data}`)
          res.render('result', {isDeer: parseInt(data) ? 'Deer!' : 'No deer!'});
        });
      }, (err) => {
        console.log(`ERROR: ${err}`);
        res.sendStatus(500);
      });
    }
  });
});

router.post('/uploadtraining', function(req, res, next) {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.send(500);
    }

    if(files.zip.size !== 0) {
      //Will need to be updated if we want multipul Training data sets at a time
      let linkPath = path.normalize(path.join(__dirname, training_data));

      console.log("Zip file received. Clearing out old data...")
      const removeDirectory= child_process.spawnSync('rm', ["-r" , training_data]);
      const removeModel= child_process.spawnSync('rm', [model_data]);
      const makeDirectory = child_process.spawnSync('mkdir', [training_data]);

      console.log("Data cleared. Unzipping...")
	    var zip = new AdmZip(files.zip.path); // reading archives
      zip.extractAllTo(linkPath, true);

      console.log("Unzipped. Starting trainer...");
      const pythonProcess = child_process.spawn('python3', ["./trainer.py"]);
      
      console.log("Running trainer.");
      pythonProcess.stdout.on('data', (data) => {
        console.log(`Training: ${data}`)
      });

      pythonProcess.stderr.on('data', (data) => {
        console.log(`Training error: ${data}`);
      });

      res.render('testpicture');
    }
  });
});

module.exports = router;
