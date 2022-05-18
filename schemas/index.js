const mongoose = require('mongoose');

const connect = () => { 
    await mongoose
        .connect('mongodb://localhost:27017/scd', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .catch((err) => {
            console.error(err);
        });
};

module.exports = connect;
