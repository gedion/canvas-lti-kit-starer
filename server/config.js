const fs = require('fs');

const conf = {};

//TODO: for developpment only. Move to secure files
conf.getLtiOptions = () => ({
    "consumerKey": "7de17678e7bd603380a47742b59ae06a",
    "consumerSecret": "e855b5cd447b5221092e7b82ab3d922d"
});

conf.getsslOptions = () => {


//TODO: set up your certs appropriately
const sslOptions = {
  "sslCaBundleCrt": "/etc/httpd/conf/ssl/comodo-bundle-sha2.crt",
  "sslKeyFile": "/etc/httpd/conf/ssl/*.oit-canvas-dev-web.oit.umn.edu.key",
  "sslCertFile": "/etc/httpd/conf/ssl/*.oit-canvas-dev-web.oit.umn.edu.crt"
};

  const ca = [];
  let chain = fs.readFileSync(sslOptions.sslCaBundleCrt, 'utf8');
  chain = chain.split("\n");

  let cert = [];

  for (let i = 0, len = chain.length; i < len; i++) {
    let line = chain[i];
    if (!(line.length !== 0)) {
      continue;
    }
    cert.push(line);
    if (line.match(/-END CERTIFICATE-/)) {
      ca.push(cert.join("\n"));
      cert = [];
    }
  }
  let certContent = fs.readFileSync(sslOptions.sslCertFile);
  return {
    ca: ca,
    key: fs.readFileSync(sslOptions.sslKeyFile),
    cert: certContent
  };

}
module.exports = conf;
