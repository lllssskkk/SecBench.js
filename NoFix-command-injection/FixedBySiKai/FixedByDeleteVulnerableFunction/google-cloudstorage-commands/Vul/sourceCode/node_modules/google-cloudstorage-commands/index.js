const exec = require('child_process').exec
const path = require('path')
const P = (() => {

    const BASE_URL = 'https://storage.googleapis.com/'

    function upload(inputDirectory, bucket, force = false) {
        return new Promise((yes, no) => {
            let _path = path.resolve(inputDirectory)
            let _rn = force ? '-r' : '-Rn'
            let _cmd = exec(`gsutil -m cp ${_rn} -a public-read ${_path} ${bucket}`)
            _cmd.on('exit', (code) => {
                yes()
            })
        })
    }

    function cors(bucket) {
        return new Promise((yes, no) => {
            let _c = `gsutil cors set ${path.join(__dirname,'google-storage-cors.json')} ${bucket}`
            console.log(_c);
            let _cmd = exec(_c, (code, stdout, stderr) => {
              /*
              The output is in stderr for some reason
              */
                    yes()
                /*if (stderr) {
                    no(stderr)
                } else {
                }*/
            });
        })
    }

    function publicRead(bucket) {
        return new Promise((yes, no) => {
            let _c = `gsutil -m acl set -R -a public-read ${bucket}`
            console.log(_c);
            let _cmd = exec(_c, (code, stdout, stderr) => {
                if (stderr) {
                    no(stderr)
                } else {
                    yes()
                }
            });
        })
    }

    return {
        baseUrl:BASE_URL,
        upload: upload,
        cors: cors,
        publicRead: publicRead
    }

})()

module.exports = P