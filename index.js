const https = require('https')
const async = require('async');
const request = require('request');
const port = 3000;

const seedUserId = 1;
const seedUserUrl = 'https://aiq-challenge-api.appspot.com/api/instagram/account/';
const followersStr = '/followers?cursor=';

let output = [];

function fetchUser(url, cb) {
  request.get(url, function(error, response, body)  {
    body = JSON.parse(body);
    console.log('body', body)
    const { data: { verified, follower_count, id, username } } = body;
    output.push({follower_count, id, verified, username })
    if (cb) {
      cb()
    } else {
      fetchFollowers(id)
   }
  })
}

function fetchFollowers(id) {
  let url = `https://aiq-challenge-api.appspot.com/api/instagram/account/${id}/followers?cursor=`
  request.get(url, function(error, response, body)  {
      body = JSON.parse(body);
      const { data } = body;
      const followers = data
      async.each(followers, function(id, callback) {
        let url = seedUserUrl + id;
        fetchUser(url, callback);
      }, function(err) {
          if( err ) {
            console.log(err);
          } else {
            const results = sortResults();
            console.log('results', results) // [ '1', '3', '2' ]
          }
      });
  });
}

function sortResults() {
  return output.sort((x, y) => {
    if (x.verified < y.verified) {
      return 1
    } else if (x.verified === y.verified) {
      if (x.follower_count === y.follower_count) {
        return x.username[0] < y.username[0];
      } else {
        return x.follower_count < y.follower_count;
      }
    }
  }).map(obj => obj.id)
}


let url = seedUserUrl + seedUserId;
fetchUser(url);


https.createServer({}, (req, res) => {
  res.writeHead(200);
}).listen(port);