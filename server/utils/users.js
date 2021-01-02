class Users{
    constructor(){
        this.users = [];
    }
    addUser = ({id, userName, displayName, channel}) => {
        // if user already exists
        const userExist = this.users.find((user) => {
            return user.userName === userName && user.channel === channel
        });
        if(userExist){
            return { errors: [ { msg: "User already Exists!"} ] };
        }
        const newUser = {
            id,
            userName,
            displayName,
            channel
        }
        this.users.push(newUser);
        return newUser;
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