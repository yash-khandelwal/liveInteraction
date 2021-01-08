class Questions{
    constructor(){
        this.questions = new Map();
    }
    addQuestion = (data) => {

        this.questions.set(data.id , data)
        return data ;
    }
    answerQuestion =(index , answer) =>{
        this.questions.get(index).answer.push(answer)  ;
    }
    removeQuestion = (index) => {
        this.questions.delete(index);

    }
}
module.exports = Questions;