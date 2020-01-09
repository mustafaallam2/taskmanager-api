const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');


const app = express();
const port = process.env.PORT || 3000;


// app.use((req,res,next)=>{
//     res.status(503).send('the site is under maintainance  ')

// })


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);





app.listen(port, () => {
    console.log('srver is up on port ' + port);
})

