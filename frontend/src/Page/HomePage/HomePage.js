import axios from "axios"
import React, { useEffect, useState, useRef, useCallback } from "react"
import getRequestedHeader from "../../utils/util"
import { IoLogOut } from "react-icons/io5";
import { useAuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoChatboxEllipses } from "react-icons/io5";
import './HomePage.css'
import moment from "moment";
import { useSocketContext } from "../../Context/SocketContext";
import { env } from "../../env";
import ReactPlayer from 'react-player'
import peer from '../../service/peer'

const HomePage = () => {
    const headers = getRequestedHeader()
    const [users, setUsers] = useState([])
    const [loggedInUserData, setLoggedInUserData] = useState({})
    const [selectedUser, setSelectedUser] = useState()
    const [inputMessage, setInputMessage] = useState()
    const [messages, setMessages] = useState()
    const navigate = useNavigate()
    const [remoteUserSocketId, setRemoteUserSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState()
    const [isCall, setIsCall] = useState(false)
    const [acceptCallButton, setAcceptCallButton] = useState(false)
    const [tempData, setTempData] = useState()
    const [showCallingState, setShowCallingText] = useState(false)
    const [showPolicy, setShowPolicy] = useState(false)

    const {authUser, setAuthUser, setUserId} = useAuthContext()
    const {onlineUsers, socket} = useSocketContext()
    const containerRef = useRef(null);

  // This effect will run every time the component updates
  useEffect(() => {
    // Scroll to the bottom of the container
    // containerRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if(messages?.length){
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  },[messages]);

    useEffect(()=>{
        socket?.on("newMessage", (newMessage)=>{
            setMessages((prevState)=>[...prevState, newMessage])
        })

        return () => {
            socket?.off("newMessage")
        }
    },[socket])


    useEffect(()=>{
        if(!authUser?.length){
            navigate('/login')
        }
    },[authUser])

    useEffect(()=>{
        if(selectedUser){
            fetchPrevMessages()
        }
    },[selectedUser])

    const fetchPrevMessages = async () => {
        axios.get(`http://localhost:9999/api/message/getmessages/${selectedUser?._id}`, headers).then((res)=>{
            if(res?.data?.success){
                setMessages(res?.data?.result)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    const fetchUsers = async () => {
        axios.get(`http://localhost:9999/api/user/allUsers`, headers).then((res)=>{
            if(res?.data?.success){
                setUsers(res?.data?.results)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    const fetchLoggedInUserData = async () => {
        axios.get(`http://localhost:9999/api/auth/getUserData`, headers).then((res)=>{
            if(res?.data?.success){
                setLoggedInUserData(res?.data?.result)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    useEffect(()=>{
        fetchUsers()
        fetchLoggedInUserData()
    },[])

    const handleLogOut = () => {
        localStorage.clear()
        setAuthUser('')
        setUserId('')
    }

    const handleInputChange = (e) => {
        const value = e?.target?.value
        setInputMessage(value)
    }

    const handleSendMessage = () => {
        if(!inputMessage?.length){
            alert("please enter message!")
        }
        else{
            const payload = {
                "message" : inputMessage
            }
            axios.post(`http://localhost:9999/api/message/send/${selectedUser?._id}`, payload, headers).then((res)=>{
                if(res?.data?.success){
                    setInputMessage('')
                }
            }).catch((err)=>{
                alert("Errror")
            })
        }
    }

    const handleSelectRemoteUser = async (user) => {
        if(isCall){
            setIsCall(false)
            setMyStream(null)
        }
        setSelectedUser(user)
        const value = onlineUsers?.hasOwnProperty(user._id) ? onlineUsers[user._id] : null
        setRemoteUserSocketId(value)
    }

    const handleCall = useCallback(async () => {
        setIsCall(true)
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        const offer = await peer.getOffer()
        socket.emit("user:call", {to: remoteUserSocketId, offer})
        setMyStream(stream)
        setShowCallingText(true)
    },[socket, remoteUserSocketId])

    const handleIncommingCall = useCallback(async (data)=>{
        setAcceptCallButton(true)
        setTempData(data)
    },[])

    const sendStream = useCallback(() => {
        // Check if myStream is defined before accessing its methods
        if (myStream && !peer.peer.track) {
            for (const track of myStream.getTracks()) {
                peer.peer.addTrack(track, myStream)
            }
            setShowPolicy(false)
        }
    }, [myStream]);

    const handleAcceptCallBtn = useCallback(async () =>{
        if(tempData){
        setAcceptCallButton(false)
        setIsCall(true)
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        setMyStream(stream)
        console.log("tempData:",tempData)
        const ans = await peer.getAnswer(tempData?.offer)
        socket.emit("user:call:accepted",{to : tempData?.from, ans})
        setShowPolicy(true)
        }
    },[socket, tempData])


    const handleCallAccepted = useCallback((data)=>{
        const {from, ans} = data
        peer.setLocalDescription(ans)
        setShowCallingText(false)
        setShowPolicy(true)
    },[])

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteUserSocketId });
      }, [remoteUserSocketId, socket]);

      const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
          const ans = await peer.getAnswer(offer);
          socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
      );

      const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
      }, []);

    useEffect(()=>{
        if(peer?.peer){
            peer.peer.addEventListener('negotiationneeded',handleNegoNeeded)
        }
        return()=>{
            if(peer?.peer){
                peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded)
            }
        }
    },[handleNegoNeeded])

    useEffect(() => {
            peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
            });
      }, []);

      const endCallBtn = (e) => {
        e?.preventDefault()
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
            }
            setMyStream(null)
            setRemoteStream(null)
            setIsCall(false)
      }


    useEffect(()=>{
        if(socket){
            socket.on("user:incomming:call", handleIncommingCall)
            socket.on("user:call:accepted", handleCallAccepted)
            socket.on("peer:nego:needed", handleNegoNeedIncomming);
            socket.on("peer:nego:final", handleNegoNeedFinal);
            }
        return () => {
            if(socket){
            socket.off("user:incomming:call", handleIncommingCall)
            socket.off("user:call:accepted", handleCallAccepted)
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
            }
        }
    },[socket, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal])

    return (
        <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{height:'100vh', width:'30vw', display:'flex', flexDirection:'column', overflow:'scroll'}}>
                <div style={{display:'flex', flexDirection:'row', alignItems:'center', background:'#8599FF', justifyContent:'space-between'}}>
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                        <img src={loggedInUserData?.profilePic} width={60} height={60} style={{padding:'10px'}}></img>
                        <div style={{display:'flex', flexDirection:'column', paddingLeft: '10px', alignItems:'start'}}>
                            <p style={{fontSize:'30px', fontWeight:'bold'}}>{loggedInUserData?.name}</p>
                            <p style={{fontSize:'15px'}}>🟢 Online</p>
                        </div>
                    </div>
                    <IoLogOut style={{color:'#fff', fontSize:'30px'}} onClick={handleLogOut}/>
                </div>
                <div>
                    {
                        users?.map((user, index) => {
                            return (
                                <>
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center'}} key={index} className={selectedUser?._id === user?._id ? 'selected-chat' : ''} onClick={()=>handleSelectRemoteUser(user)}>
                                    <img src={user?.profilePic} width={60} height={60} style={{padding:'10px'}}></img>
                                    <div style={{display:'flex', flexDirection:'column', paddingLeft: '10px', alignItems:'start'}}>
                                        <p style={{fontSize:'25px', fontWeight:'normal'}}>{user?.name}</p>
                                        <p style={{fontSize:'15px'}}>{ onlineUsers?.hasOwnProperty(user._id) ? '🟢 Online' : '🔴 Offline' } </p>
                                    </div>
                                </div>
                                <hr></hr>
                                </>

                            )
                        })
                    }
                </div>
            </div>
            <>
            <div style={{height:'100vh', width:'70vw', justifyContent:'center', alignItems:'center', display:'flex'}}>
            {
                isCall || acceptCallButton ? 
                <div ref={containerRef}>
                    {showPolicy && <div>please accept security policy<button onClick={sendStream}>Accept</button></div>}
                    <div>{showCallingState && 'Calling'}</div>
                    <div>
                        {acceptCallButton && <button onClick={handleAcceptCallBtn}>Accept Call</button>}
                    </div>
                    <div style={{display:'flex', flexDirection:'column', background:'#8599FF'}}>
                        <div style={{display:'flex', flexDirection:'row', alignItems:'end', padding:'10px'}}>
                        <div style={{width:'400px', height:'300px'}}>
                            {
                                remoteStream && 
                                <ReactPlayer
                                playing
                                url={remoteStream}
                                width="400px"
                                height="300px"
                            />
                            }
                        </div>
                        <div style={{width:'300px', height:'200px'}}>
                        {
                            myStream && 
                            <ReactPlayer
                                playing
                                url={myStream}
                                width="300px"
                                height="200px"
                            />
                        }</div>
                        </div>
                        <div>
                            <button>Mic</button> 
                            <button>Video</button> 
                            <button onClick={endCallBtn}>End Call</button></div>
                    </div>
                </div>

            :
             !selectedUser ?
                <div>
                    <h1>Hi {loggedInUserData?.name} Welcome to the Chat App!</h1>
                    <p style={{fontSize:'25px'}}>Select a message to start messaging</p>
                    <IoChatboxEllipses style={{fontSize: '100px'}}/>

                </div>
                :
                <div style={{height: '100vh', width:'70vw', alignItems:'start', display:'flex',justifyContent:'end', flexDirection:'column'}}>
                    <div style={{width:'60vw', background:'#8599FF', justifyContent:'space-between', display:'flex', height:'130px', alignItems:'center'}}>
                        <p style={{padding:'20px', fontSize:'20px'}}>To : {selectedUser?.name}</p>
                        <button style={{width:'100px'}} onClick={handleCall}>Call</button>
                    </div>
                        {
                            messages?.length 
                            ? 
                            <div style={{display: 'flex', flexDirection:'column', width:'60vw', alignItems:'end', height:'130vh', overflow:'scroll'}} ref={containerRef}>
                                { 
                                    messages?.map((message, index)=>{
                                        return(
                                            <div style={{display:'flex', flexDirection:'column', margin:'5px'}}>
                                                <div key={index} style={{padding:'10px 10px', borderRadius:'5px', display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center'}} className={message.senderId === loggedInUserData?._id ? 'sender-chat-color' : 'receiver-chat-color'}>
                                                    <p>{message?.message}</p>
                                                    <img src={message.senderId === loggedInUserData?._id ? loggedInUserData?.profilePic : selectedUser?.profilePic} width={40} height={40} style={{paddingLeft:'10px'}}/>
                                                </div>
                                                <div>
                                                    {moment(message?.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            :
                                <div style={{display:'flex', justifyContent:'center', alignItems:'center',width:'60vw', height:'130vh', fontSize:'30px'}}  ref={containerRef}>Say Hi!</div>
                        }
                    <div style={{margin:'10px'}}>
                        <input type="text" className="chat-input" onChange={handleInputChange} value={inputMessage} placeholder="Enter Message....."></input>
                        <button className="chat-send-button" onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            
        }
            </div>
            </>
            
        </div>
    )
}

export default HomePage