//CLI: npm install nodemailer --save
var nodemailer = require('nodemailer');
var MyConstants = require("./MyConstants.js");
var transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS
  }
});
var EmailUtil = {
  send(email, id, token) {
    var text = 'Cảm ơn bạn đã đăng kí! Vui lòng nhấn vào link bên dưới để xác thực tài khoản:\n';
    text += 'http://' + MyConstants.HOSTNAME + '/verify?id=' + id + '&token=' + token;
    return new Promise(function (resolve, reject) {
      var mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'Xác thực tài khoản LTShop',
        text: text
      };
      transporter.sendMail(mailOptions, function (err, result) {
        if (err) reject(err);
        resolve(true);
      });
    });
  }
};
module.exports = EmailUtil;