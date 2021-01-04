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
                    <p>{privateMessages}</p>
                    {chating===user.displayName && (
                        <div>
                            <p>{privateMessages.has(user.userName)} {user.userName}</p>
                            {privateMessages.get(user.userName).messages.map((message, itsindex) => {
                                return <div key={itsindex}>
                                    <p>{message.user}: {message.text}</p>
                                </div>
                            })}
                            {/* {.map((message) => {
                                return <div>
                                    <p>{message.user}: {message.text}</p>
                                </div>
                            }} */}
                        </div>)
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
