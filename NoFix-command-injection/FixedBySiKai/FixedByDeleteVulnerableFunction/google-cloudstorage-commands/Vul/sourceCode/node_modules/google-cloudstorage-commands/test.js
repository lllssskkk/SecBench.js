var xhr = require('xhr-request');
xhr('https://r2---sn-5hnedn7e.googlevideo.com/videoplayback/id/38f46173d5ef65fb/itag/140/source/youtube/requiressl/yes/mv/m/initcwndbps/6987500/ms/au/pl/20/mn/sn-5hnedn7e/mm/31/ratebypass/yes/mime/audio%2Fmp4/otfp/1/gir/yes/clen/211400/lmt/1471146106750011/dur/17.716/signature/1C3F69BD53B09F50997CDD0175895F9DDB082484.8FF55B165968604BB39272B4E40B16363ECFEDD2/upn/6IuEaezbNkw/key/dg_yt0/mt/1477095887/ip/104.155.67.105/ipbits/0/expire/1477117754/sparams/ip,ipbits,expire,id,itag,source,requiressl,mv,initcwndbps,ms,pl,mn,mm,ratebypass,mime,otfp,gir,clen,lmt,dur/', {
  method: 'GET',
  responseType: 'arraybuffer',
  headers: {
    'Range': `bytes=0-887`,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
  },
}, function(err, data) {
  if(err){
    throw err
  }
  console.log(data);
})
