import React , {useState} from 'react'


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
                        setformData('');
                    }
                }}>Send</button>
            </form>

            {
                [...question.keys()].map((key ) =>{
                    let ques= question.get(key) ;
                    return (
                        <div key={key}>
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
                                    sendAnswer(key , answer);
                                    setAnswer('');
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
