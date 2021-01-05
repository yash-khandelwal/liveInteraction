import React, {useState, useEffect} from 'react';
import queryString from 'query-string';
import io from "socket.io-client";

import ChatApp from './ChatApp/ChatApp.jsx';
import PollsApp from './PollsApp/PollsApp.jsx';
import QnAApp from './QnAApp/QnAApp.jsx';
import StatSection from './StatSection/StatSection.jsx';

let socket;
let mp = new Map();

const Channel = ({location}) => {
    const [interaction, setInteraction] = useState('Chat');
    const ENDPOINT = 'http://localhost:5001/chat';
    const [channelChatMessages, setChannelChatMessages] = useState([]);
    const [channelChatMessage, setChannelChatMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState('anonymous');
    const [displayName, setDisplayName] = useState('anonymous');
    const [channelId, setChannelId] = useState('anonymous');
    const [privateMessages, setPrivateMessages] = useState(new Map());

    useEffect(()=>{
        const {username, displayname, channel} = queryString.parse(location.search);
        console.log(username, displayname, channel);
        setUserName(username);
        setDisplayName(displayname);
        setChannelId(channel)
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
        console.log(privateMessages);
    }, [privateMessages])
    
    useEffect(() => {
        socket.on('newConnect', (data) => {
            mp.set(data.user.id, data.user.userName);
            setUsers(prevUsers=>[...prevUsers, data.user]);
            setPrivateMessages(prev => new Map([...prev, [data.user.userName,  {active: true, messages: []}]]))
            // console.log(mp);
        })
        socket.on('userDisconnect', (userId) => {
            mp.delete(userId);
            setUsers(prevUsers=>{
                return prevUsers.filter(user=>user.id!==userId);
            });
            setPrivateMessages((prevPrivateMessages) => {
                prevPrivateMessages.set(mp.get(userId), {active: true, messages: []});
                return prevPrivateMessages;
            });
            // console.log(mp);
        })
        socket.on('channelMessage', (data) => {
            setChannelChatMessages((prevChatMessages) => {
                return [...prevChatMessages, data];
            })
        });
        // will happen only when client starts streaming
        socket.on('channelData', (data) => {
            var privatemsg = new Map();
            data.users.map((user) => {
                mp.set(user.id, user.userName);
                privatemsg.set(user.userName, {active: true, messages: []});
                return true;
            });
            // console.log(privatemsg);
            setPrivateMessages(privatemsg);
            // console.log("privateMessages: ", privateMessages);
            setUsers(data.users);
            // console.log(mp);
        });
        socket.on('infoMessage', (data) => {
            setChannelChatMessages((prevChatMessages) => {
                return [...prevChatMessages, {
                    user: 'info',
                    text: data.info
                }];
            })
        })
        socket.on('privateMessage', (data) => {
            console.log("aayaa toh");
            console.log(data);
            // console.log(privateMessages);
            setPrivateMessages((prevPrivateMessages) => {
                console.log(prevPrivateMessages);
                let messageArr = prevPrivateMessages.get(data.from).messages;
                // messageArr = messageArr.messages;
                if(!messageArr){
                    messageArr = [];
                }
                messageArr.push({
                    user: data.from,
                    text: data.message
                })
                prevPrivateMessages.set(data.from, {active: true, messages: messageArr});
                // console.log(prevPrivateMessages);
                return (new Map(prevPrivateMessages));
            });
            // console.log(privateMessages);
        })
    }, []);


    const sendChatMessageToChannel = () => {
        const data = {
            from: userName,
            fromDisplayName: displayName,
            to: channelId,
            message: channelChatMessage
        }
        socket.emit('sendChatMessageToChannel', data, () => {setChannelChatMessage('')});
    }

    const sendChatMessageToUser = ({toSocket, to, message}) => {
        const data = {
            from: userName,
            fromDisplayName: displayName,
            toSocket: toSocket,
            to: to,
            message: message
        }
        socket.emit('sendChatMessageToUser', data, () => {
            setPrivateMessages((prevPrivateMessages) => {
                console.log(prevPrivateMessages);
                let messageArr = prevPrivateMessages.get(data.to).messages;
                // messageArr = messageArr.messages;
                if(!messageArr){
                    messageArr = [];
                }
                messageArr.push({
                    user: data.from,
                    text: data.message
                })
                prevPrivateMessages.set(data.to, {active: true, messages: messageArr});
                console.log(prevPrivateMessages);
                return (new Map(prevPrivateMessages));
            });
            console.log('nothing');
        })
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
                messages={channelChatMessages}
                message={channelChatMessage}
                setMessage={setChannelChatMessage}
                sendMessageToChannel={sendChatMessageToChannel}
                sendMessageToUser={sendChatMessageToUser}
                users={users}
                privateMessages={privateMessages}
            />}
            {interaction === 'Polls' && <PollsApp />}
            {interaction === 'QnA' && <QnAApp />}
        </div>
    )
}

export default Channel;
