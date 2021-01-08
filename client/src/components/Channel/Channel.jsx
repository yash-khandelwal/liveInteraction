import React, {useState, useEffect} from 'react';
import queryString from 'query-string';
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

import ChatApp from './ChatApp/ChatApp.jsx';
import PollsApp from './PollsApp/PollsApp.jsx';
import QnAApp from './QnAApp/QnAApp.jsx';
import StatSection from './StatSection/StatSection.jsx';

import './Channel.css';

let socket;
let mp = new Map();

const Channel = ({location}) => {
    //global states
    const [interaction, setInteraction] = useState('Chat');
    const ENDPOINT = 'http://localhost:5001';
    const [users, setUsers] = useState([]);
    const [userData, setuserData] = useState({
        userName:'',
        displayName:'',
        channelId:'',
        role: ''
    })

    //chat states
    const [channelChatMessages, setChannelChatMessages] = useState([]);
    const [channelChatMessage, setChannelChatMessage] = useState('');
    const [privateMessages, setPrivateMessages] = useState(new Map());


    //question states
    const [question, setQuestion] = useState(new Map())
    // poll states
    const [polls, setPolls] = useState(new Map());
    const [pollIds, setPollIds] = useState([]);
    const [createPoll, setCreatePoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [optionList, setOptionList] = useState([]);


    useEffect(()=>{
        const {username, displayname, channel, presenter} = queryString.parse(location.search);
        console.log(username, displayname, channel, presenter);
        setuserData({userName:username , displayName:displayname , channelId:channel, role: presenter==='host'})
        socket = io(ENDPOINT);
        socket.on("connection", (error)=>{
            if(error){
                console.log(error);
            } else{
                console.log("connected to backend");
            }
        })
        console.log(socket);
        socket.emit('join', {userName: username, displayName: displayname, channel: channel, role: presenter==='host'}, (err) => {
            if(err){
                alert(err);
            }
        });
    }, [ENDPOINT, location.search]);

    useEffect(() => {
        socket.on('newConnect', (data) => {
            mp.set(data.user.id, data.user.userName);
            setUsers(prevUsers=>[...prevUsers, data.user]);
            setPrivateMessages(prev => new Map([...prev, [data.user.userName,  {active: true, messages: [], unread: 0}]]))
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
                privatemsg.set(user.userName, {active: true, messages: [], unread: 0});
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
            setUsers(prevUsers => {
                let newUsers = [data.from];
                prevUsers = prevUsers.filter(prev =>{
                    if(prev.userName !== data.from){
                        return true;
                    } else {
                        newUsers[0] = prev;
                        return false;
                    }
                } );
                newUsers =  [...newUsers, ...prevUsers];
                console.log(newUsers);
                return newUsers;
            })
            setPrivateMessages((prevPrivateMessages) => {
                console.log(prevPrivateMessages);
                let {messages, unread} = prevPrivateMessages.get(data.from);
                console.log(messages, unread);
                // messageArr = messageArr.messages;
                if(!messages){
                    messages = [];
                }
                messages.push({
                    user: data.fromDisplayName,
                    text: data.message
                })
                prevPrivateMessages.set(data.from, {active: true, messages: messages, unread: unread+1});
                // console.log(prevPrivateMessages);
                return (new Map(prevPrivateMessages));
            });
            // console.log(privateMessages);
        })
        socket.on('newPoll', (data) => {
            console.log('poll aya aya aya aya');
            setPolls(prevPolls => {
                prevPolls.set(data.id, {...data, voted: false});
                console.log(prevPolls.get(data.id));
                return new Map(prevPolls);
            })
            setPollIds(prev => [...prev, data.id]);
        })
        socket.on('channelQuestion', (data) => {
            // console.log(question)
            setQuestion((prevChatMessages) => {
                prevChatMessages.set(data.id , data);
                return new Map(prevChatMessages);
            })
        });

        socket.on('channelAnswer', (data) => {
            setQuestion((prevQues) => {
                let ques = prevQues.get(data.index);
                ques.answer.push(data.answer)
                prevQues.set(data.index , ques);
                return new Map(prevQues) ;
            })
        });
    }, []);

    const sendChatMessageToChannel = () => {
        const data = {
            from: userData.userName ,
            fromDisplayName: userData.displayName,
            to: userData.channelId,
            message: channelChatMessage
        }
        socket.emit('sendChatMessageToChannel', data, () => {setChannelChatMessage('')});
    }

    const sendChatMessageToUser = ({toSocket, to, message}) => {
        const data = {
            from: userData.userName ,
            fromDisplayName: userData.displayName,
            toSocket: toSocket,
            to: to,
            message: message
        }
        socket.emit('sendChatMessageToUser', data, () => {
            setUsers(prevUsers => {
                let newUsers = [data.to];
                prevUsers = prevUsers.filter(prev =>{
                    if(prev.userName !== data.to){
                        return true;
                    } else {
                        newUsers[0] = prev;
                        return false;
                    }
                } );
                newUsers =  [...newUsers, ...prevUsers];
                console.log(newUsers);
                return newUsers;
            })
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
                prevPrivateMessages.set(data.to, {active: true, messages: messageArr, unread: 0});
                console.log(prevPrivateMessages);
                return (new Map(prevPrivateMessages));
            });
            console.log('nothing');
        })
        
    }

    const sendPoll = (pollData) => {
        // console.log(pollData);
        socket.emit('sendPoll', {
            user: userData,
            question: pollData.pollQuestion,
            options: pollData.optionList
        }, () => {
            console.log('poll publish success');
        })
    }
    const sendVote = (id, optionNum) => {
        socket.emit('vote', {id, optionNum}, () => {
            setPolls(prev => {
                prev.get(id).voted = optionNum;
                console.log(prev.get(id));
                return new Map(prev);
            });
        });
    }

    const sendVoteUpdate = (id, prevOptionNum, newOptionNum) => {
        console.log("sendVoteUpdate triggered");
        socket.emit('voteUpdate', {id, prevOptionNum, newOptionNum}, () => {
            setPolls(prev => {
                prev.get(id).voted = newOptionNum;
                console.log(prev.get(id));
                return new Map(prev);
            });
        });
    }

    const sendQuestionToChannel = (formData) => {
        const data = {
            id: uuidv4(),
            from: userData.userName ,
            fromDisplayName: userData.displayName,
            to: userData.channelId,
            question: formData,
            answer:[]
        }
        socket.emit('sendQuestionToChannel', data, () => {});
    }
    const sendAnswer = (index , answer) => {
        const ansobj= {answer , from: userData.userName , display: userData.displayName }
        const data ={index , answer: ansobj , to:userData.channelId}
        console.log(index, answer)
        socket.emit('sendAnswerToChannel', data, () => {});
    }

    

    return (
        <div>
            <StatSection 
                users={users}
            />
            <h3>Channel: {userData.channelId}</h3>
            <h3>userName: {userData.userName}</h3>
            <div>
                <button onClick={(e)=>{
                    setInteraction('Chat')
                }}>Chat</button>
                <button 
                
                onClick={(e)=>{
                    setInteraction('Polls')
                }}>Polls</button>
                <button 
                
                onClick={(e)=>{
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
                userData={userData}
                setPrivateMessages={setPrivateMessages}
            />}
            {interaction === 'Polls' && <PollsApp
                socket={socket}
                role={true}
                polls={polls}
                publishPoll={sendPoll}
                createPoll={createPoll}
                setCreatePoll={setCreatePoll}
                pollQuestion={pollQuestion}
                setPollQuestion={setPollQuestion}
                optionList={optionList}
                setOptionList={setOptionList}
                pollIds={pollIds}
                sendVote={sendVote}
                sendVoteUpdate={sendVoteUpdate}
            />}
            {interaction === 'QnA' && <QnAApp
                role={userData.role}
                question={question}
                sendQuestionToChannel={sendQuestionToChannel}
                sendAnswer={sendAnswer}
            />}
        </div>
    )
}

export default Channel;
