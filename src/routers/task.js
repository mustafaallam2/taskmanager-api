const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();


router.post('/tasks', auth , async (req, res) => {
    const task = new Task({
        ...req.body,
        owner:req.user._id
    
    });

    try {
        await task.save()
       
        res.send(task);

    } catch (error) {

    }

    // task.save().then(() => {
    //     res.status(201);
    //     res.send(task);
    // }).catch((error) => {
    //     res.status(400);
    //     res.send(error);
    // });


});


router.get('/tasks',auth ,async (req, res) => {
    const match ={};
    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed ==='true' ;
    }

    if(req.query.sortBy){
        parts = req.query.sortBy.split('_');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 ;
    }
    try {
       // const tasks = await Task.find({owner:req.user._id});
        await req.user.populate({
            path : 'tasks',
            match,
            options:{
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort

            }
        }).execPopulate();
        res.status(201).send(req.user.tasks)

    } catch (error) {
        res.status(500).send();

    }



    // Task.find({}).then((tasks) => {
    //     res.status(200).send(tasks)
    // }).catch((error) => {
    //     res.status(500).send()
    // });

});

router.get('/tasks/:taskID', auth ,async (req, res) => {
    try {

        //const task = await Task.findById(req.params.taskID);
        const task = await Task.findOne({_id:req.params.taskID,owner:req.user._id});
        
        if (!task) {
            return res.status(404).send();
        }

        res.status(200).send(task);

    } catch (error) {
        res.status(500).send()

    }


    //     if (!task) {
    //         return res.status(404).send();
    //     }
    //     res.status(200).send(task)
    // }).catch((error) => {
    //     res.status(500).send()
    // });

});


router.patch('/tasks/:taskID', auth ,async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })
    if (!isValidOperation) {
        res.status(400).send({
            error: 'invalid operation'
        });
    }
    try {
        const task = await Task.findOne({_id:req.params.taskID,owner:req.user._id});
        
        if (!task) {
             return res.status(404).send()
         }

        updates.forEach((update)=>{
            task[update]=req.body[update];
        });

        await task.save();


        //const task = await Task.findByIdAndUpdate(req.params.taskID, req.body, {
        //     new: true,
        //     runValidators: true
        // });
       
        res.send(task);
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }

});


router.delete('/tasks/:taskID', auth,async (req, res) => {
    try {

        const task = await Task.findOneAndDelete({_id:req.params.taskID, owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }

        res.status(200).send(task);

    } catch (error) {
        res.status(400).send();

    }
})

module.exports = router;