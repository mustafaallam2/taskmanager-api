const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const emails = require('../emails/accounts');

router.post('/users', async (req, res) => {


    const user = new User(req.body);
    try {

        await user.save();
        const token = await user.generateToken();
        emails.sendWelcomEmail(user.email,user.name);
        res.status(201).send({user,token});
    } catch (error) {
        res.status(404).send(error);

    }



});

router.post('/users/login', async (req, res) => {

    //const user = new User(req.body);
    
    try {
          const user = await User.findByCredentials(req.body.email,req.body.password);
          const token = await user.generateToken();
          res.send({user,token});

    } catch (error) {
        res.status(400).send(error);

    }



});

router.post('/users/logout',auth, async (req, res) => {

    //const user = new User(req.body);

    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();

    } catch (error) {
        res.status(400).send(error);

    }



});


router.post('/users/logoutAll', auth, async (req, res) => {

    //const user = new User(req.body);

    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();

    } catch (error) {
        res.status(500).send(error);

    }



});

router.get('/users/me',auth ,async (req, res) => {

    res.send(req.user);


});

router.get('/users/:userID/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.userID)
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('content-Type','image/png');
        res.send(user.avatar);


    } catch (error) {
        res.status(404).send();
    }


});


// router.get('/users/:userID', async (req, res) => {

//     try {
//         const user = await User.findById(req.params.userID);
//         if (!user) {
//             return res.status(404).send();

//         }
//         res.status(200).send(user)


//     } catch (error) {
//         res.status(500).send();
//     }


// });

router.patch('/users/me', auth,async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })
    if (!isValidOperation) {
        res.status(400).send({
            error: 'invalid operation'
        });
    }
    try {
        updates.forEach((update)=>{
            req.user[update] = req.body[update];
        });
        await req.user.save();

       // const user = await User.findByIdAndUpdate(req.params.userID, req.body, {
        //     new: true,
        //     runValidators: true
        // });

        res.send(req.user);
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }

});


router.delete('/users/me', auth ,async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove();
        emails.sendCancelEmail(user.email, user.name);
        res.send(req.user);

    } catch (error) {
        res.status(400).send();

    }
})


router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
         res.send(req.user);


    } catch (error) {
        res.status(400).send();

    }
})


const upload = multer({
    // dest: path.join(__dirname, '../uploads'),
    limits : {
        fileSize :1000000
    },
    fileFilter(req,file,cb){
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('only imgs accepted'))
        }
        cb(undefined,true)
    }
});


router.post('/users/me/avatar', auth ,upload.single('avatar'), async (req, res) => {
    
    try {
        if (req.file) {
                const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
            req.user.avatar = buffer;
            await req.user.save();
            return res.send(req.user);
   }
        res.send();



    } catch (error) {
        res.status(400).send(error);

    }



},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
});


module.exports = router;