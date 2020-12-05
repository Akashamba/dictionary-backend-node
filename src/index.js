const express = require("express");
const bodyParser = require("body-parser");
const http = require("https");
const cors  =require("cors");

const app = express();
// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', 'https://m1gnj.csb.app/' );
//   next();
// })
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // body-parser
app.use(bodyParser.json()); // body-parser

app.listen(process.env.PORT || 5000);

app.get("/", (req, res) => {
  res.send(
    'API hit successfully. Send request with word in params like "/api/run".'
  );
});

app.get("/api/:word", (req, res) => {
  // , req.headers.app_id, req.headers.app_key
  extract(req.params.word, res);
});

function extract(word, this_response) {
  // + '?fields=' + fields + '&strictMatch=' + strictMatch,

  const app_id = "3a12c817";
  const app_key = "5ad5f3e79690e46fd4adbd080cfe9883";
  const options = {
    host: "od-api.oxforddictionaries.com",
    port: "443",
    path: "/api/v2/entries/en-us/" + word,
    method: "GET",
    headers: {
      app_id: app_id,
      app_key: app_key
    }
  };

  let body = "";
  let parsed = {};

    http.get(options, (res) => {
      res.on("data", (d) => {
        body += d;
      });
  
      res.on("end", () => {
        body = JSON.parse(body);
        parsed.id = body.id;
        parsed.word = body.word;
        parsed.results = [];

        try {

          for (var i = 0; i < body.results.length; i++) {
            let obj = {};
    
            obj.definitions = [];
            obj.synonyms = [];
            obj.examples = [];
    
            obj.id = body.results[i].id;
            for (var j = 0; j < body.results[i].lexicalEntries.length; j++) {
              obj.type = body.results[i].lexicalEntries[j].lexicalCategory.text;
              for (var k = 0; k < body.results[i].lexicalEntries[j].entries.length; k++) {
                for (var l = 0; l < body.results[i].lexicalEntries[j].entries[k].senses.length; l++) {
                  obj.definitions.push(body.results[i].lexicalEntries[j].entries[k].senses[l].definitions);
                  obj.examples.push(body.results[i].lexicalEntries[j].entries[k].senses[l].examples);
                  obj.synonyms.push(body.results[i].lexicalEntries[j].entries[k].senses[l].synonyms);
                }
              }
            }
            parsed.results.push(obj);
            console.log('done')
        }
      }
      catch (e) {
        console.log(e.message)
        parsed = body;
      }
        this_response.json(parsed);
        // this_response.json(JSON.stringify(parsed, null, 0));
      });
    });
  }

