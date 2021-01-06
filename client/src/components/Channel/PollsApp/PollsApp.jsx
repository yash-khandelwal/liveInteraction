import React, {useState, useEffect} from 'react'

const PollsApp = ({socket, role}) => {
    const [polls, setPolls] = useState(new Map());
    setPolls(prevPolls => {
        prevPolls.set('0', {question: 'this is a question?', options: ['option1', 'option2', 'option3'], votes: [0, 0, 0]});
    })
    useEffect(() => {
        socket.on('testAck', res => {
            console.log("got Response ", res);
        })
    }, []);
    const sendTestMessage = () => {
        socket.emit('test', "message from polls app!");
    }
    
    return (
        <div>
            <h1>PollsApp</h1>
            {/* <button
                onClick={() => {
                    sendTestMessage();
                }}
            >hello</button> */}
            {polls}
        </div>
    )
}

export default PollsApp
