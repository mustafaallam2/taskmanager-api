const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error('age can not be less than 0');
            }

        }
    },
    email: {
        type: String,
        unique : true,
        required: true,
        lowercase: true,
        trim: true,

        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('email is invalid');
            }

        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            //alternative value.toLowerCase().includes('password')
            if (validator.contains(value.toLowerCase(), 'password')) {
                throw new Error('password can not contain password ');

            }
            if (value.length < 6) {
                throw new Error('password can not be less than 6 chars');

            }

        }
    },
    tokens:[{
        token: {
            type: String,
            required : true
        }
    }],
    avatar : {
        type: Buffer
    }
},{
    timestamps : true
});


userSchema.methods.generateToken= async function () {
    user = this ;
    const token = jwt.sign({'id': user._id.toString()},process.env.JWT_SECRET,{expiresIn:'7 day'})
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token ;
};
userSchema.methods.toJSON=  function () {
    user = this ;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject ; 
        

};

userSchema.statics.findByCredentials= async (email,password)=>{

    const user = await User.findOne({email});
    if (!user){
        throw new Error('unable to find user')
    }
    const isMach= await bcrypt.compare(password,user.password);
    if(!isMach){
        throw new Error('incorrect credentials')
    }

    return user ;

}

userSchema.virtual('tasks',{

    ref: 'tasks',
    localField :'_id',
    foreignField: 'owner'
});

//hash user password before saving 
userSchema.pre('save', async function (next) {
    const user= this;
if (user.isModified('password')) {
    user.password= await bcrypt.hash(user.password,8);
}
    next();
})

//delete user tasks when user is deleted 
userSchema.pre('remove',async function (next){
    const user = this ;
    await Task.deleteMany({owner:user._id});

    next();
})

const User = mongoose.model('User', userSchema)

module.exports =User;