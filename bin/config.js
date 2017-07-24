/**
 * Created by Nonjene on 2017/2/10.
 */

const path = require("path");

const StaticConfig = {
    ftp: {
        host: "192.168.1.1",
        port: "",
        user: "user",
        password: "ps"
    },
    remoteBasePath: "", //ftp的基目录，用于打印地址时方便排除。m.okpapa.com
    remotePath: "/activity/{$target}",
    localAssetPath: "build/activity/{$target}",
    domainName: "http://m.okpapa.com",
    cdnDomain: "https://images.okpapa.com"
};
let config = Object.assign(
    {
        target: ["target_not_setted"],
        env: "production",
        fronendEnv: null,
        proSpecific: null,
        duan: ["pc", "m"],
        proxyPort: 80,
        servePort: 3005
    },
    StaticConfig
);

let EXPORT = "export";
if (path.sep.indexOf("\\") > -1) {
    EXPORT = "SET"; //windows
}

const getTargetCommander = (which = 0) => {
    return `${EXPORT} BUILD_TARGET=` + config.target[which];
};
const getEnvCommander = () => {
    let com = `${EXPORT} NODE_ENV=` + config.env;
    //指定预发还是生产
    if (config.proSpecific) {
        com += `&&${EXPORT} PRO_SPECIFIC=${config.proSpecific}`;
    }
    return com;
};
const getDuanCommander = () => {
    return config.duan ? `${EXPORT} DUAN=` + config.duan.join(",") : "";
};

module.exports = Object.assign(
    {
        setTarget(name = "") {
            //console.log(name)
            config.target = name.split(",");
        },
        getTarget() {
            return config.target;
        },
        setBuildAllScope(name = "") {
            config.buildAllScope = name.split(",");
        },
        setEnv(env) {
            config.env = env;
        },
        setDuan(duan) {
            config.duan = duan.split(",");
        },
        getConf(prop) {
            return prop ? config[prop] : config;
        },
        setConf(prop, val) {
            config[prop] = val;
        },
        getEnvDesc() {
            if (config.proSpecific) {
                switch (config.proSpecific) {
                    case "pre":
                        return "预发环境😛";
                    case "pro":
                        return "生产环境😝";
                    case "test":
                        return "开发环境🤔";
                    default:
                        return "黑洞";
                }
            } else {
                return "开发环境🤔";
            }
        },
        getFrontendEnvDesc() {
            switch (config.fronendEnv) {
                case "test":
                    return "测试环境🥝";
                case "pre":
                    return "预发环境🥑";
                case "produce":
                    return "生产环境🍆";
                default:
                    return "程序错误🙄";
            }
        },

        combineBuild(which) {
            return [getEnvCommander(), getTargetCommander(which), getDuanCommander(), "npm run build"].join(
                "&&"
            );
        },
        combineWatch(which) {
            return [getEnvCommander(), getTargetCommander(which), getDuanCommander(), "npm run watch"].join(
                "&&"
            );
        },
        getTargetCommander,
        getEnvCommander,
        getDuanCommander
    },
    StaticConfig
);
