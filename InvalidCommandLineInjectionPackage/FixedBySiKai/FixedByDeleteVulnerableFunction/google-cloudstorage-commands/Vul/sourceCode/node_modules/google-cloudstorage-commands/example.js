const GOOGLE = require('./index')
var fs = require('fs');
var path = require('path');
const BUCKET_NAME = 'samrad-deuxtube/'
const BUCKET = `gs://${BUCKET_NAME}`

return GOOGLE.upload("some/directory", "gs://soe_bucket/path...", force: boolean)
  .then(() => {})
  .catch(err => {
    console.log(err);
  })
