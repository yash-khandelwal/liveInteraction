import React from 'react'

const ChatAll = ({messages, message, setMessage, sendMessage}) => {
    return (
        <div>
            <p>ChatAll</p>
            {messages.map((msg, index) => {
                return <p key={index}>{msg.user}: {msg.text}</p>
            })}
            <form>
                <input 
                    type="text" 
                    name="currentMessage" 
                    id="currentMessage" 
                    onChange={(e) => {
                    setMessage(e.target.value);
                    }}
                    value={message}
                    autoFocus
                />
                <button type="submit" onClick={(event) => {
                    event.preventDefault();
                    if(message){
                        sendMessage();
                    }
                }}>Send</button>
            </form>
        </div>
    )
}

export default ChatAll
