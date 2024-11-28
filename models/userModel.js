import mongoose  from 'mongoose';
const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    place:String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the user model
const UserModel = mongoose.model('User', userSchema);

export default UserModel;
