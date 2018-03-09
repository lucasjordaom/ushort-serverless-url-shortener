'use strict';
// Lambda URL shortener function, called via API Gateway
// Creates an Amazon S3 object with random name and adds metadata for http redirect
const AWS = require('aws-sdk');
const url = require('url');

// configuration to be customized
const S3_Bucket = process.env['S3_BUCKET'];
const S3_Region = process.env['S3_REGION'];
const S3_Prefix = process.env['S3_PREFIX'];


// encrypt function f237e23857185c24xasq to \u0002VWS\u0001VW\\QSU\\Q\u0007VP\u001c\u0005\u0017\u0015
const encrypt = (actual_key) => {
    
    let number = 100; //Any integer value
    let result_key = "";
    let i;
    for(i=0; i<actual_key.length;i++)
    {
        result_key += String.fromCharCode(number^actual_key.charCodeAt(i));
    }
    return (result_key);
}

// generate a 5 char shortid
//THe first version was with 7 'x' and 7 char long
const shortid = () => {
  return 'xxxxx'.replace(/x/g, (c) => {
    return (Math.random()*36|0).toString(36);
  });
};

exports.handler = (event, context, cb) => {
  const s3 = new AWS.S3({ region: S3_Region });
  const url_long = event.url_long;
  const cdn_prefix = event.cdn_prefix;
  const key_val = event.key_val;
  let retry = 0;    // try at most 3 times to create unique id

  // Done function
  const done = (url_short, error) => {
      
    if(!error && url_short){
        cb(null, url_short );
        console.log("Success, short_url = " + url_short);
    }
    else{
         console.log("Erro: = " + error);
         cb(null, error);
    }
    
  };

  const check_and_create_s3_redirect = (s3_bucket, key_short, url_long) => {
    s3.headObject({ Bucket: s3_bucket, Key: key_short }, (err, data) => {
      if (err) {
        // we should normall have a NotFound error showing that the id is not already in use
        if (err.code === "NotFound") {
          // normal execution path
          s3.putObject({ Bucket: s3_bucket, Key: key_short, Body: "", WebsiteRedirectLocation: url_long, ContentType: "text/plain" }, 
            (err, data) => {
              if (err) { done("", err.message); }
              else {
                const ret_url = "https://" + cdn_prefix + "/" + id_short;
                console.log("Success, short_url = " + ret_url);
                done(ret_url, "");
              }
            });
        } else {
          // treat all other errors as fatal
          done("", "Could not find an suitable name, error: " + err.code);
        }
      } else {
        // we found a duplicate, let's retry a limited number of times
        retry += 1;
        if (retry <= 3) {
          check_and_create_s3_redirect(s3_bucket, key_short, url_long);
        } else {
          // abort after 3 tries
          done("", "Cannot find an unused short id, aborting." );
        }
      }
    });
  };

  // check if url is valid
  const url_check = url.parse(url_long);
  if (!((url_check) && (url_check.host))) { return done("", "Invalid URL format parsed: " + url_check + " Long: " + url_long); }
  
  // check key_val to \u0002VWS\u0001VW\\QSU\\Q\u0007VP\u001c\u0005\u0017\u0015
  if(String(encrypt(key_val)) !== "\u0002VWS\u0001VW\\QSU\\Q\u0007VP\u001c\u0005\u0017\u0015"){ return done("", "Invalid API Key: " + key_val); }
  

  console.log("Long URL to shorten: " + url_long);
  const id_short = shortid();
  const key_short = S3_Prefix + "/" + id_short;
  console.log("Short id = " + key_short);
  check_and_create_s3_redirect(S3_Bucket, key_short, url_long);
};
