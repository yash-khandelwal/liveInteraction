import React, {useEffect} from 'react';
import './PollsApp.css';


const PollsApp = ({socket, role, publishPoll, polls, createPoll, setCreatePoll, pollQuestion, setPollQuestion, optionList, setOptionList, pollIds, sendVote, sendVoteUpdate}) => {
    const handleChange = (event, index) => {
        console.log("handle change triggered!");
        let newList = [...optionList];
        newList[index] = event.target.value;
        setOptionList(newList);
    }
    const addOption = () => {
        setOptionList(prevList => [...prevList, '']);
        console.log(optionList);
    }
    const removeOption = (index) => {
        setOptionList(prevList => prevList.filter((option, i) => {
            return i !== index;
        }));
    }
    useEffect(() => {
        socket.on('testAck', res => {
            console.log("got Response ", res);
        })
    }, [socket]);
    const sendTestMessage = () => {
        socket.emit('test', "message from polls app!");
    }
    
    return (
        <div>
            <h1>PollsApp</h1>
            <button
                onClick={() => {
                    sendTestMessage();
                }}
            >hello</button>
            {[...polls.keys()].map(id => {
                return <div key={id}>
                    <p>Question: {polls.get(id).question}</p>
                    {polls.get(id).options.map((option, index) => {
                        if(polls.get(id).voted === index){
                            return <li 
                                key={index}
                                style={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    if(!polls.get(id).voted)
                                        sendVote(id, index);
                                    else
                                        sendVoteUpdate(id, polls.get(id).voted, index);
                                }}
                                className='selected'
                                >{option.option}</li>
                        }
                        return <li 
                                key={index}
                                style={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    if(!polls.get(id).voted)
                                        sendVote(id, index);
                                    else
                                        sendVoteUpdate(id, polls.get(id).voted, index);
                                }}
                                >{option.option}</li>
                    })}
                </div>
            })}
            {role && (
                <div>
                    <button
                        onClick={() => {
                            setCreatePoll(prev => !prev);
                        }}
                    >create new poll</button>
                    <div>
                        {createPoll&&
                        <div>
                            <textarea
                                value={pollQuestion}
                                onChange={(e) => {
                                    setPollQuestion(e.target.value);
                                }}
                                autoFocus
                            ></textarea>
                            <hr/>
                            {optionList.map((option, index) => {
                                return <div key={index}>
                                    <input type="text" name="option" value={option} onChange={(event)=>{
                                        handleChange(event, index);
                                    }}
                                        autoFocus
                                    />
                                    <button 
                                        onClick={(event)=>{
                                            event.preventDefault();
                                            removeOption(index);
                                        }}
                                    >
                                        remove option
                                    </button>
                                    <hr/>
                                </div>
                            })}
                            <button
                                onClick={(event)=>{
                                    event.preventDefault();
                                    addOption();
                                }}
                            >add option</button>
                            <hr/>
                            <button
                                onClick={() => {
                                    publishPoll({pollQuestion, optionList});
                                    setPollQuestion('');
                                    setOptionList([]);
                                    setCreatePoll(false);
                                }}
                            >publish</button>
                        </div>
                        }
                    </div>
                </div>
            )}
        </div>
    )
}

export default PollsApp;