#!/usr/bin/env node
const program = require("commander");
const fs = require("fs");

const { build } = require('./bin/build');
const { watch } = require('./bin/watch');
const { create } = require('./bin/create');
const initProj = require('./bin/initProj');
const ftp = require('./bin/ftp');
const test = require('./bin/test');
const serve = require('./bin/serve');
const getAllProjName = require('./bin/util/getAllProjName');

const chalk = require('chalk');
const opn = require('opn');


const config = require('./bin/config');
const frontendConf = require('./bin/frontend_conf');
const { deployStaticAll, deployStaticEnvTest } = require('./bin/deployStatic');

const U = undefined; //为了消除webstorm编辑器的警告提示
program
  .option('s, --serve', '开启服务', U, U)

  .option('w, --watch <活动名>', '开发一个活动，监听代码实时刷新，并开启服务', name => config.setTarget(name), U)
  .option('r, --release <活动名>', '发布某个活动的代码。默认生产环境', name => config.setTarget(name), U)
  .option('--pre', '代码发布到预发环境(只配合r命令)', () => config.setEnv('production'), U)
  .option('--test', '代码发布到测试环境(只配合r命令)', () => config.setEnv('production'), U)

  .option('--duan <pc或m>', 'pc端or移动端。', name => config.setDuan(name), U)

  .option('ra, --release-all', '发布所有活动。', U, U)
  .option('wa, --watch-all', '发布所有活动。', U, U)

  .option('u, --upload [活动名]', '上传测试服务器', name => config.setTarget(name), U)
  .option('--open','打开测试服务器链接', U, U)
  .option('--scope <文件夹范围>','发布所有活动的文件夹范围', name=>config.setBuildAllScope(name), U)

  .option('-p, --production', '设置为：非开发模式。默认release自带此属性', () => config.setEnv('production'), U)
  .option('-d, --development', '设置为：不压缩且包含inline-source-map。默认watch自带此属性', () => config.setEnv('development'), U)


  .option('M, --mode <环境>', '设置前端API接口的环境, 只有在测试环境时生效，预发和生产环境无效。', mode => fFrontEndConf(mode), U)
  .option('--hard-mode <环境>', '强制更改前端API接口', mode => fFrontEndConf(mode,'hard'), U)

  .option('C, --create <活动名>', '新建一个活动', name => setTimeout(()=> createAHuodong(name), 0), U)
  .option('-t --template <模版名>', '新建一个活动时，选一个模版', (name, meno) => meno = name, U)

  .option('P, --proxy-port <端口>', '定义本地测试的平台页面服务端口，默认80', name => config.setConf('proxyPort', name), U)
  .option('--copy-static', '把bin/resource/static的文件复制到3个环境', U, U)
  .option('init --init <项目文件夹名>', '创建项目目录', U, U)
  .option('set-source <git地址>', 'git url，指定 init 创建目录的源', U, U)

  .option('--debug', '测试代码', () => test.getAllProjName(), U)
  .parse(process.argv);

// 配置写入process.env的形式

//console.log(chalk.yellow('提示: 假如遇到不清楚的代码报错, 请联系构建工具维护者') );
let _tmp = {};

if (program.serve) {
  serve.start();
}
if (program.release) {
  // release模式自动切换到生产环境
  setReleaseConfig();

  frontendConf.promiseSetDone
    .then(() => build())
    .then(() => program.upload && upload())
    .catch(e => console.log(chalk.red(e)));
}

if (program.releaseAll) {
  config.setTarget(getAllProjName(config.getConf('buildAllScope')));
  setReleaseConfig();

  frontendConf.promiseSetDone
    .then(() => build())
    .then(() => program.upload && upload())
    .catch(e => console.log(chalk.red(e)));
}

// 没有查能不能知道只有一个upload参数，先这么写了。
if (
  !program.release &&
  !program.releaseAll &&
  !program.copyStatic &&
  program.upload
) {
  upload();
}

if (program.watch) {
  //预设api接口为测试环境
  if (!program.mode) {
    frontendConf.setFrontEndConf('test', config.getTarget());
  }
  !program.production && config.setEnv('development');
  frontendConf.promiseSetDone
    .then(() => watch())
    .catch(e => console.log(chalk.red(e)));

  // 复制common.js 到build/
  deployStaticEnvTest();
}
if (program.watchAll) {
  console.log('功能后续开发。');
}

// 生成common.js
if(program.copyStatic){
  deployStaticAll(!!program.upload)
}

// 创建项目
if (program.init) {
  const projName = program.init;
  console.log(chalk.cyan('正在初始化项目...'));
  initProj(projName, program.setSource || config.getConf('seedUrl'))
    .then(() => console.log(chalk.green(`项目 ${projName} 创建成功。`)))
    .catch(e => console.log(chalk.red(e)));
}

function upload() {
  ftp
    .uploadToServer({ desc: '活动：' + config.getTarget(), isLog: false })
    .then(remoteLink => {
      if (program.open) opn(remoteLink, { wait: false });
    })
    .catch(e => console.error(e));
}

function fFrontEndConf(mode, isHard) {
  //不让在非测试环境改
  if (program.release && !program.test && !isHard) {
    return console.log(chalk.red('不允许在非测试环境改 ( ._.)'));
    /*if (!isHard) {

        }*/
  }

  return frontendConf.setFrontEndConf(mode, config.getTarget());
}

function createAHuodong(name) {
  create(name, program.template).catch(err => console.error(chalk.red(err)));
}

function setReleaseConfig() {
  const target = config.getTarget();
  //预发
  if (program.pre) {
    //前端代码的config设置后端接口为预发环境。
    !program.hardMode && frontendConf.setFrontEndConf('pre', target);
    //指定是发不到预发的文件夹
    config.setConf('proSpecific', 'pre');
  } else if (program.test) {
    !program.hardMode && frontendConf.setFrontEndConf('test', target);
    !program.mode && config.setConf('proSpecific', 'test');
  } else {
    //生产
    //不可以单独一个端，可以公用代码，比如pc转跳m的时候，可减少代码加载
    config.setDuan('m,pc');

    frontendConf.setFrontEndConf('produce', target);
    config.setConf('proSpecific', 'pro');
  }
}