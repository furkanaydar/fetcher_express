const request = require('request');
const bodyParser = require('body-parser');

//import express
const express = require('express');
const cheerio = require('cheerio')
var cookieParser = require('cookie-parser')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
  }
  
  function getJsonString(body, index) {
    let start, end;
    for (var i=index; i>=0 ; i--)
    {
      if (body[i] === '{') {
        start = i;
        break;
      }
    }
  
    for (var i=index ; i<body.length; i++)
    {
      if (body[i] === '}') {
        end = i;
        break;
      }
    }
  
    return body.substring(start, end+1);
  };
  
  function getVideoUri(jsonBody) {
    let uriIndex = jsonBody.indexOf('"url"');
    let start = uriIndex + 7;
    let end;
    for (var i=start; i<=jsonBody.length; i++)
    {
      if (jsonBody[i] == '"') {
        end = i;
        break;
      }
    }
  
    return jsonBody.substring(start, end);
  };


async function doRequests(adminkey, currentPage, videoId) {
    const rp = require('request-promise').defaults({ jar: true , simple: false});
    var options_login = {
        method: 'POST',
        uri: 'https://stagedoctorstus.com/User/UserLogin',
        formData: {
            'Email':'enesbuyukbayram@yandex.com',
            'Password' : '123456',
            '__RequestVerificationToken': '7kQ8B2kFq-2EcVALQyoMkS71ns9tbx5uyXXyujAtEmUmLVFwQJxklGy9uyZWpKgFfngOzVDu5wo7rI2P1qDYZB1cUA7XZN05qVgfttKSz1s1'
        }
    };

    var options_page = {
        method: 'GET',
        uri: currentPage,
    }

    let sourceUris = [];
    let response
    response = await rp(options_login);
    response = await rp(options_page);
    const $ = cheerio.load(response);
    $('iframe').each( function( key, value ) {
        let sourceUri = value.attribs.src;
        sourceUris.push(sourceUri);
      });
    var options_video_json = {
        url: sourceUris[videoId],
        method: 'GET'
    };
    response = await rp(options_video_json);
    let all_1080 = getAllIndexes(response, 'quality":"1080p"');
    for (var i=0; i<all_1080.length; i++)
    {
        let jstr = getJsonString(response, all_1080[i]);
        let video_uri = getVideoUri(jstr);
        if (video_uri.indexOf('https') >= 0) {
            return video_uri;
        }
    }
  }

app.post("/urls", async (req, res) => {
    let pageUri = req.body.page;
    let videoId = req.body.vid;
    let adminkey = req.body.adminkey || '7kQ8B2kFq-2EcVALQyoMkS71ns9tbx5uyXXyujAtEmUmLVFwQJxklGy9uyZWpKgFfngOzVDu5wo7rI2P1qDYZB1cUA7XZN05qVgfttKSz1s1';
    
    res.json({ response: await doRequests(adminkey, pageUri, videoId)});


});

app.get('/urls', (req, res) => {
    res.json({ response: 'OK!'});
})

//export app
module.exports = app;
