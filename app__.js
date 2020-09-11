const request = require('request');
const bodyParser = require('body-parser');

//import express
const express = require('express');
const cheerio = require('cheerio')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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


async function doRequests(currentPage, videoId) {
    var request = require('request')

    const rp = require('request-promise').defaults({ jar: true , simple: false});

    let response

    var options_login_get = {
      method: 'POST',
      uri: 'https://stagedoctorstus.com/User/UserLogin'
    }
    response = await rp(options_login_get);
    const loginPage = cheerio.load(response);
    let inputs = loginPage('input')
    const requestKey = inputs[0].attribs.value;

    var options_login = {
        method: 'POST',
        uri: 'https://stagedoctorstus.com/User/UserLogin',
        formData: {
            'Email':'enesbuyukbayram@yandex.com',
            'Password' : '123456',
            '__RequestVerificationToken': requestKey
        }
    };

    var options_page = {
        method: 'GET',
        uri: currentPage,
    }

    let sourceUris = [];

    response = await rp(options_login);

    response = await rp(options_page);
    const $ = cheerio.load(response);
    $('iframe').each( function( key, value ) {
        let sourceUri = value.attribs.src;
        sourceUris.push(sourceUri);
      });
    if (sourceUris.length === 0) {
      return 'ERROR';
    }  

    var options_video_json = {
        uri: sourceUris[videoId],
        method: 'GET'
    };
    response = await rp(options_video_json);
    let all_1080 = getAllIndexes(response, 'quality":"1080p"');
    let all_720 = getAllIndexes(response, 'quality":720p');
    for (var i=0; i<all_1080.length; i++)
    {
        if (all_1080 === 'undefined' || all_1080.length === 0) {
          all_1080 = all_720;
        }
        let jstr = getJsonString(response, all_1080[i]);
        let video_uri = getVideoUri(jstr);
        if (video_uri.indexOf('https') >= 0) {
            return video_uri;
        }
    }
  }

function woof() {

}  
app.post("/urls", async (req, res) => {
    let pageUri = req.body.page;
    let videoId = req.body.vid;
    
    res.json({ response: await doRequests(pageUri, videoId)});
});

app.get('/urls', (req, res) => {
    res.json({ response: 'OK!'});
})

//export app
module.exports = app;
