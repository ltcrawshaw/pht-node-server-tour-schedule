let http = require('http');
let fs = require('fs');
let path = require('path');
let nodemailer = require('nodemailer');
let qs = require('querystring');
let util = require('util');
let connect = require('connect');
var mime = require('mime');
const { group } = require('console');

let app = connect();

function logit(req, res, next) {
    util.log(util.format('Request received: %s, %s', req.method, req.url));
    next();
}

function send404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain'});
    res.write('Error 404: Resource not found.');
    res.end()
}

//let server = http.createServer(function(req, res){
function serverConfig(req, res, next) {

        //resolve file path to filesystem path
        let fileurl;
        if (req.url == '/') {
            fileurl = '/index.html';
        } else {
            fileurl = req.url;
        }

        let filepath = path.resolve('./pht' + fileurl);

        //lookup mime type
        let fileExt = path.extname(filepath)
        let mimeType = mime.getType([fileExt]);
        if (!mimeType && fileurl !== '/send') {
            send404(res);
            return
        }

        //see if we have that file
        fs.stat(filepath, function (err) {

            // if file doesn't exist
            if (err && fileurl !== '/send') {
                send404(res);
                return;
            };

            //finall stream the file
            if(req.url == '/send') {
                filepath = './pht/sent.html';
                res.writeHead(200, {'content-type': 'text/html'});
            } else {
                res.writeHead(200, {'content-type': mimeType})
            }
            fs.createReadStream(filepath).pipe(res);
        });
 }
    
function contactEmail(req, res, next) {
    if (req.method == 'POST') {
       
        //get form data and parse to variables
        req.on('data', function(data){
            let body = '';
            body += data;
            let result = qs.parse(body);
            let name = result.name;
            let email = result.email;
            let question = result.question;

            if (question == undefined) {
                return;
            }

            //create HTML output
            let output = '<p>You have a new message</p>' +
                '<h3>Message</h3>' +
                '<ul>' +
                '<li>Name: ' + name + '</li>' +
                '<li>Email: ' + email + '</li>' +
                '<li>Question: ' + question + '</li>' +
                '</ul>';
            let transporter = nodemailer.createTransport({
                host: '',
                port: 587,
                secure: false,
                auth: {
                    user: '',
                    pass: ''
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            //setup email
            let mailOptions = {
                from: '"NodeMailer Contact" <>',
                to: '',
                subject: 'NodeMailer Submission',
                html: output
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if(error) {
                    return console.log(error);
                } else {
                    console.log('Message sent: %s', info.messageId);
                }
            });
        });
    }   else {
        send404(res);
    }
    next();
}

function reservationEmail(req, res, next) {
    if (req.method == 'POST') {
       
        //get form data and parse to variables
        req.on('data', function(data){
            let body = '';
            body += data;
            let result = qs.parse(body);
            let tour = result.tour;
            let fname = result.myfname;
            let lname = result.mylname;
            let email = result.myemail;
            let phone = result.myphone;
            let date = result.mydate;
            let group = result.mygroup;
            let comments = result.mycomments;

            if (tour == undefined) {
                return;
            }

            //create HTML output
            let output = '<p>You have a new message</p>' +
                '<h3>Message</h3>' +
                '<ul>' +
                '<li>Name: ' + fname + lname + '</li>' +
                '<li>Tour: ' + tour + '</li>' +
                '<li>Email: ' + email + '</li>' +
                '<li>Phone: ' + phone + '</li>' +
                '<li>Date: ' + date + '</li>' +
                '<li>Group: ' + group + '</li>' +
                '<li>Comments: ' + comments + '</li>' +
                '</ul>';
            let transporter = nodemailer.createTransport({
                host: '',
                port: ,
                secure: false,
                auth: {
                    user: '',
                    pass: ''
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            //setup email
            let mailOptions = {
                from: '"NodeMailer Contact" <>',
                to: '',
                subject: '',
                html: output
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if(error) {
                    return console.log(error);
                } else {
                    console.log('Message sent: %s', info.messageId);
                }
            });
        });
    }   else {
        send404(res);
    }
    next();
}

app.use('/send', contactEmail);

app.use('/send', reservationEmail);

app.use(logit);

app.use(serverConfig);

http.createServer(app).listen(3000);

console.log('server running on port 3000')
