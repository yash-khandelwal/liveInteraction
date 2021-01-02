import React, {useState, useEffect} from 'react';
import queryString from 'query-string';
import io from "socket.io-client";

import ChatApp from './ChatApp/ChatApp.jsx';
import PollsApp from './PollsApp/PollsApp.jsx';
import QnAApp from './QnAApp/QnAApp.jsx';
import StatSection from './StatSection/StatSection.jsx';

let socket;

const Channel = ({location}) => {
    const [interaction, setInteraction] = useState('Chat');
    const ENDPOINT = 'http://localhost:5001';
    const [chatMessages, setChatMessages] = useState([]);
    const [chatMessage, setChatMessage] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(()=>{
        const {username, displayname, channel} = queryString.parse(location.search);
        console.log(username, displayname, channel);
        socket = io(ENDPOINT);
        socket.on("connection", (error)=>{
            if(error){
                console.log(error);
            } else{
                console.log("connected to backend");
            }
        })
        console.log(socket);
        socket.emit('join', {userName: username, displayName: displayname, channel: channel}, (err) => {
            if(err){
                alert(err);
            }
        });
    }, [ENDPOINT, location.search]);
    useEffect(() => {
        socket.on('message', (message) => {
            setChatMessages((prevChatMessages) => {
                return [...prevChatMessages, message];
            })
        })
        socket.on('channelData', (data) => {
            setUsers(data.users);
        });
    }, []);

    const sendChatMessageToChannel = () => {
        socket.emit('sendChatMessageToChannel', chatMessage, () => {setChatMessage('')});
    }

    return (
        <div>
            <StatSection 
                users={users}
            />
            <div>
                <button onClick={(e)=>{
                    setInteraction('Chat')
                }}>Chat</button>
                <button onClick={(e)=>{
                    setInteraction('Polls')
                }}>Polls</button>
                <button onClick={(e)=>{
                    setInteraction('QnA')
                }}>QnA</button>
            </div>
            {interaction === 'Chat' && <ChatApp 
                messages={chatMessages}
                message={chatMessage}
                setMessage={setChatMessage}
                sendMessageToChannel={sendChatMessageToChannel}
            />}
            {interaction === 'Polls' && <PollsApp />}
            {interaction === 'QnA' && <QnAApp />}
        </div>
    )
}

export default Channel;
