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
    const [userName, setUserName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [channel_, setChannel] = useState('');
    const ENDPOINT = 'http://localhost:5001';

    useEffect(()=>{
        const {username, displayname, channel} = queryString.parse(location.search);
        console.log(username, displayname, channel);
        socket = io(ENDPOINT);
        console.log(socket);
        setUserName(username)
        setDisplayName(displayname)
        setChannel(channel)
        socket.emit('join', {userName, displayName, channel: channel_}, (err) => {
            if(err){
                alert(err);
            }
        });
        console.log(location.search);
    }, [ENDPOINT, location.search]);

    useEffect(() => {
        socket.on('message', message => {
            // setMessages(msgs => [ ...msgs, message ]);
            console.log("message");
        });
        
        socket.on("roomData", ({ users }) => {
            // setUsers(users);
            console.log("roomData");
        });
    }, []);

    const sendMessage = (event) => {
        event.preventDefault();

        // if(message) {
        //     socket.emit('sendMessage', message, () => setMessage(''));
        // }
    }

    return (
        <div>
            <StatSection />
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
            {interaction === 'Chat' && <ChatApp />}
            {interaction === 'Polls' && <PollsApp />}
            {interaction === 'QnA' && <QnAApp />}
        </div>
    )
}

export default Channel;
