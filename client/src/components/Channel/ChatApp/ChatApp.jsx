import React, {useState} from 'react'
import ChatAll from './ChatAll/ChatAll.jsx';
import ChatPrivate from './ChatPrivate/ChatPrivate.jsx'

const ChatApp = ({messages, message, setMessage, sendMessageToChannel}) => {
    const [convType, setConvType] = useState('Channel');
    return (
        <div>
            <h1>ChatApp</h1>
            <div>
                <button onClick={() => {
                    setConvType('Channel');
                }}>channel</button>
                <button onClick={() => {
                    setConvType('Private');
                }}>private</button>
            </div>
            <div>
                {convType==='Channel' && <ChatAll 
                    messages={messages}
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessageToChannel}
                />}
                {convType==='Private' && <ChatPrivate />}
            </div>
        </div>
    )
}

export default ChatApp
