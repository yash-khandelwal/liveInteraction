import React, {useState} from 'react'

import './ChatPrivate.css';

const ChatPrivate = ({users, sendMessage, privateMessages}) => {
    const [message, setMessage] = useState('');
    const [chating, setChating] = useState(null);
    return (
        <div className='private-chat'>
            <hr/>
            {users.map((user, index) => {
                return <div key = {index}>
                    <h3
                        onClick={() => {
                            setChating(prev=>prev===user.displayName?null:user.displayName);
                            setMessage('');
                        }}
                        style={{
                            cursor: 'pointer',
                        }}
                    >{user.displayName}</h3>
                    {
                        (chating===user.displayName) &&
                        (<div>
                            {privateMessages.get(user.userName).messages && privateMessages.get(user.userName).messages.map((message, index) =>{
                                return (
                                    <p key={index}><span className='username'>{message.user}</span> {message.text}</p>         
                                )
                            })}
                            <form>
                                <input 
                                    type="text" 
                                    name="message" 
                                    id="message"
                                    value={message}
                                    onChange={(e)=>{
                                        setMessage(e.target.value);
                                    }}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        sendMessage({
                                            toSocket: user.id,
                                            to: user.userName,
                                            message: message
                                        });
                                        setMessage('');
                                    }}
                                >Send</button>
                            </form>
                        </div>
                        )
                    }
                    <hr/>
                </div>
            })}
        </div>
    )
}

export default ChatPrivate
