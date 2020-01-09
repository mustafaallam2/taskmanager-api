//const sgMail = require('@sendgrid/mail');
const sendGridApiKey = process.env.SENDGRID_API_KEY ;

// sgMail.setApiKey(sendGridApiKey);
// sgMail.send({

//     to:'mustafaallam74@gmail.com',
//     from : 'm.allam@bawq.com',
//     subject :'test email',
//     text : 'test text'
// });


const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sendGridApiKey);

sendWelcomEmail= (email,name)=>{

const msg = {
    to: email,
    from: 'm.allam@bawq.com',
    subject: 'welcome to the task manager app',
    text: ` hi ${name} we are lucky to have you `
   
};
sgMail.send(msg);

}

sendCancelEmail = (email, name) => {

    const msg = {
        to: email,
        from: 'm.allam@bawq.com',
        subject: 'we are sorry to lose you',
        text: ` hi ${name} we are sad that you have left us  `

    };
    sgMail.send(msg);

}

module.exports = {
    sendWelcomEmail ,
    sendCancelEmail
}

