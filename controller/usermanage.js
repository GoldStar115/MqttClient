var pass_hash = require('password-hash');
var axios = require('axios');
var uidGenerator = require('node-unique-id-generator');
var assert = require('assert');
var express = require('express');
var AWS = require('aws-sdk');
var model = require('node-model');
var unique = require('array-unique');
var MobileDetect = require('mobile-detect');
var dynamodb = new AWS.DynamoDB();
var dbClient = new AWS.DynamoDB.DocumentClient();
var radarid = "radar";
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var crypto = require('crypto');
var sendgridOption = {
    auth: {
        api_user: process.env.SENDGRIDNAME,
        api_key: process.env.SENDGRIDPASS
    }
};
const baseurl = 'http://api.thecryptovault.com/'
const USERTBLNAME = "user_record";
const USEREMAILINDEXNAME = "email-index";
const USERTOKENINDEXNAME = "usertoken-index";
const RADARTBLNAME = "radar_record";
function logMsg(des, msg, islog) {
    if (islog)
        console.log(des, msg)
}
exports.index = function (req, res) {
    var md = new MobileDetect(req.headers['user-agent'])
    try {  
        if (req.cookies.usertoken != undefined && req.cookies.usertoken != ""){              
            logMsg('session', req.cookies.usertoken, false);
            if (md.mobile()) {
                res.redirect('/mobileindex');
            } else {
                logMsg('index', 'render', false)
                res.render('index');
            }
        } else {
            if (md.mobile()) {
                res.redirect('/mobilelogin');
            } else {
                logMsg('login', 'render', false)
                res.redirect('/login');
            }
        }  
    } catch (error) {
        if (md.mobile()) {
            res.redirect('/mobilelogin');
        } else {
            logMsg('login', 'render', false)
            res.redirect('/login');
        }
    }
}
// jl
exports.faq = function (req, res) {
    res.render('faq');
}
exports.admin = function (req, res) {
    res.render('admin');
}
exports.health = function (req, res) {
    res.send('OK');
}
exports.forgot = function (req, res) {
    res.render('forgot');
}
exports.mobileforgot = function (req, res) {
    res.render('mobileforgot');
}
exports.mobileindex = function (req, res) {
    try {
        if (req.cookies.usertoken != undefined && req.cookies.usertoken != "") { 
            res.render('mobileindex');
        } else {
            res.render('mobilelogin');
        }
    } catch (error) {
        res.render('mobilelogin');
    }
}
exports.login = function (req, res) {
    var md = new MobileDetect(req.headers['user-agent'])
    if (md.mobile()) {
        res.redirect('/mobilelogin');
    } else {
        logMsg('login', 'render', false)
        res.render('login');
    }
}
exports.mobilelogin = function (req, res) {
    res.render('mobilelogin');
}
exports.logout = function (req, res) {
    req.cookies.usertoken = null;
    var md = new MobileDetect(req.headers['user-agent'])
    if (md.mobile()) {
        res.redirect('/mobilelogin');
    } else {
        res.render('login');
    }
}
exports.register = function (req, res) {
    var md = new MobileDetect(req.headers['user-agent'])
    if (md.mobile()) {
        res.redirect('/mobileregister');
    } else {
        res.redirect('/register');
    }

}
exports.mobileregister = function (req, res) {
    res.render('mobileregister');
}
exports.forgot = function (req, res) {
    var md = new MobileDetect(req.headers['user-agent'])
    if (md.mobile()) {
        res.redirect('/mobileforgot');
    } else {
        res.render('forgot');
    }
}
exports.aboutus = function (req, res) {
    res.render('aboutus');
}

exports.checkuser = function (req, res) {
    axios({
        method: 'post',
        url: baseurl + 'api/checkuser',
        data: req.body
    })
        .then(function (response) {
            req.cookies.usertoken = response.data.token;
            res.json(response.data);
        })
        .catch(function (error) {
            console.log(error.message);
            res.json({ data: error.message });
        });
};
exports.createuser = function (req, res) {
    axios({
        method: 'post',
        url: baseurl + 'api/createuser',
        data: req.body
    })
        .then(function (response) {
            req.cookies.usertoken = response.data.token;
            res.json(response.data);
        })
        .catch(function (error) {
            console.log(error.message);
            res.json({ data: error.message });
        });
}
exports.updateuser = function (req, res) {
    sendRequest('post', 'api/updateuser', req.cookies.usertoken, req, res);
}
//////////Admin apis
exports.checkadmin = function (req, res) {
    axios({
        method: 'post',
        url: baseurl + 'api/checkadmin',
        data: req.body
    })
        .then(function (response) {
            req.cookies.admintoken = response.data.token;
            res.json(response.data);
        })
        .catch(function (error) {
            console.log(error.message);
            res.json({ data: error.message });
        });
};
exports.getallusers = function (req, res) {
    sendRequest('get', 'api/getallusers', req.cookies.admintoken, req, res);
}
exports.deleteuseritem = function (req, res) {
    sendRequest('post', 'api/deleteuseritem', req.cookies.admintoken, req, res);
}
exports.usersuspend = function (req, res) {
    sendRequest('post', 'api/usersuspend', req.cookies.admintoken, req, res);
}
exports.userapprove = function (req, res) {
    sendRequest('post', 'api/userapprove', req.cookies.admintoken, req, res);
}

exports.contactus = function (req, res) {
    sendRequest('post', 'contactus', '', req, res);
}
exports.forgotpass = function (req, res) {
    sendRequest('post', 'forgotpass', '', req, res);
}
exports.resetpass = function (req, res) {
    sendRequest('post', 'resetpass', '', req, res);
}
//// Radar apis
exports.putRadarItems = function (req, res) {
    sendRequest('post', 'api/createradaritem', req.cookies.usertoken, req, res);
}

exports.getRadarItems = function (req, res) {
    sendRequest('get', 'api/getradaritems', req.cookies.usertoken, req, res);
}
exports.updateItems = function (req, res) {
    sendRequest('post', 'api/updateitems', req.cookies.usertoken, req, res);
}
function sendRequest(method, url, token, req, res) {
    axios({
        method: method,
        url: `${baseurl}${url}`,
        headers: { 'x-access-token': token },
        data: req.body
    })
        .then(function (response) {
            res.json(response.data);
        })
        .catch(function (error) {
            res.json({ data: error.message });
        });
}
function sendResult(code, msg, response) {
    // response.header("Access-Control-Allow-Origin", "*");
    // response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.status(code).json(msg);
}






