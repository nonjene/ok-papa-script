/**
 * Created by Nonjene on 2017/2/10.
 */


const { exec } = require("child_process");
const opn = require('opn');
const { getConf } = require('./config');



let serve;

const serveOpen = function () {
    const DefProxyPort = getConf('proxyPort'),
          DefServePort = getConf('servePort');

    return new Promise((resovle, reject) => {
        if (serve) return reject('只能执行一次server start.');
        console.log('serve:'+DefProxyPort);
        serve = exec('node server S '+ DefServePort +' P '+ DefProxyPort, function (err, stdout, stderr) {
            if (err) {
                reject(err);
            }
        });
        serve.stdout.on('data', (data) => {
            console.log(`${data}`);
            if (data.indexOf('server started') > -1) {
                resovle();
            }
        });

        serve.on('exit', function (code) {
            console.log('server stop, code ' + code);
        });
    })


};
const stop = function () {
    if (!serve) return;
    serve.kill();

    setTimeout(() => serve = null, 0);

};

const start = function () {
    const DefServePort = getConf('servePort');
    serveOpen()
        .then(() => {
            let addr = 'http://localhost:'+ DefServePort +'/activity/';
            addr += getConf('target')[0]+'/'+ getConf('duan')[0]+'/';

            opn(addr, { wait: false });
        })
        .catch(err => console.error(err));
};

module.exports = {
    start,
    stop
};
