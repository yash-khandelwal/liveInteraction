class Questions{
    constructor(){
        this.questions = [];
    }
    addQuestion = ({id, userName, channel , question}) => {
        console.log(id, userName, displayName, channel);
        // const userExist = this.users.find((user) => {
        //     return user.userName === userName && user.channel === channel
        // });
        // if(userExist){
        //     return { errors: [ { msg: "User already Exists!"} ], user: null };
        // }
        const newQuestion = {
            id,
            userName,
            question,
            channel,
            answer:null
        }
        this.users.push(newQuestion);
        return {errors: null, user: newQuestion};
    }
    answerQuestion =(index , answer) =>{
        this.questions[index].answer = answer;
        return (this.questions[index].answer)
    }
    removeQuestion = (index) => {
        this.users = this.users.filter((user , inde) => {
            return inde!== index;
        })
        return this.users;
    }
}
module.exports = Questions;