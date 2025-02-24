require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const urlparser = require('url');
const dns = require('dns');
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//create Schema
const shorturlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: Number
});

let Shorturl = mongoose.model('Shorturl', shorturlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//shorturl post endpoint
app.post('/api/shorturl', function(req, res) {

  dns.lookup(urlparser.parse(req.body.url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid URL' });
    } else {
      const data = await Shorturl.find();
      const shorturlDict = { 
        originalUrl: req.body.url,
        shortUrl: (typeof data.length !== 'undefined' ? data.length : 0) + 1
      }
      const newShorturl = new Shorturl(shorturlDict);

      console.log(shorturlDict);
      await newShorturl.save();
      res.json({ original_url: shorturlDict.originalUrl,
                 short_url: shorturlDict.shortUrl
      });
      
    }
  });
});

//shorturl get endpoint
app.get('/api/shorturl/:short_url', async function(req, res) {

  if (req.params.short_url === 'undefined') {
    res.json({ error: 'invalid URL' });
  } else {
    const shortrurl = await Shorturl.findOne({ shortUrl: Number(req.params.short_url) });

    res.redirect(shortrurl.originalUrl);
  }
});
