import React, {useState} from 'react'

const ChatPrivate = ({users, sendMessage, privateMessages}) => {
    // const [message, setMessage] = useState('');
    const [chating, setChating] = useState(null);
    return (
        <div>
            {users.map((user, index) => {
                return <div key = {index}>
                    <h3>{user.displayName}</h3>
                    <button
                        onClick={() => {
                            setChating(user.displayName);
                        }}
                    >Chat</button>
                    {
                        <div>
                            <p>{user.userName}</p>
                            <p>{privateMessages.get(user.userName).messages && privateMessages.get(user.userName).messages.map((message, index) =>{
                                return (
                                    <li key={index}>{message.text}</li>         
                                )
                            }) }</p>
                        </div>
                    }
                    <button 
                        onClick={() => {
                            sendMessage({
                                toSocket: user.id,
                                to: user.userName,
                                message: "private hey!"
                            });
                        }}
                    >try</button>
                </div>
            })}
        </div>
    )
}

export default ChatPrivate
