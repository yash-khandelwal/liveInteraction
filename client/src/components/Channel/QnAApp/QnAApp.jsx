import React , {useState , useEffect} from 'react'


const QnAApp = ({question  , sendQuestionToChannel, sendAnswer}) => {
    const [formData, setformData] = useState('')
    const [answer, setAnswer] = useState('')

    return (
        <div>
            <h1>QnAApp</h1>
            <form>
                <input 
                    type="text" 
                    name="currentMessage" 
                    id="currentMessage" 
                    onChange={(e) => {
                    setformData(e.target.value);
                    }}
                    value={formData}
                    autoFocus
                />
                <button type="submit" onClick={(event) => {
                    event.preventDefault();
                    if(formData){
                        sendQuestionToChannel(formData);
                    }
                }}>Send</button>
            </form>

            {
                question.map((ques , index) =>{
                    return (
                        <div>
                        <p>{ques.from}: {ques.question}</p>
                        {
                            ques.answer ?
                            <p>answer: {ques.answer}</p>
                            :
                            (
                            <form>
                            <input 
                                type="text" 
                                name="currentMessage" 
                                id="currentMessage" 
                                onChange={(e) => {
                                setAnswer(e.target.value);
                                }}
                                // value={answer}
                                autoFocus
                            />
                            <button type="submit" onClick={(event) => {
                                event.preventDefault();
                                if(answer){
                                    sendAnswer(index , answer);
                                }
                            }}>Send</button>
                        </form>
                            )

                        }
                        
                        </div>
                    )
                })
            }

        </div>
    )
}

export default QnAApp
