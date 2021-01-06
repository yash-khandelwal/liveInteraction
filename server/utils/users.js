class Users{
    constructor(){
        this.users = [];
    }
    addUser = ({id, userName, displayName, channel, role}) => {
        // if user already exists
        console.log(id, userName, displayName, channel);
        const userExist = this.users.find((user) => {
            return user.userName === userName && user.channel === channel
        });
        if(userExist){
            return { errors: [ { msg: "User already Exists!"} ], user: null };
        }
        const newUser = {
            id,
            userName,
            displayName,
            channel,
            role
        }
        this.users.push(newUser);
        return {errors: null, user: newUser};
    }
    removeUser = (id) => {
        this.users = this.users.filter((user) => {
            return user.id !== id;
        })
        return this.users;
    }
    getUser = (id) => {
        return this.users.find((user) => {
            return user.id === id;
        })
    }
    getUsersInChannel = (channel) => {
        return this.users.filter((user) => user.channel === channel);
    }
}
module.exports = Users;