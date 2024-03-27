import axios from "axios"
import { useEffect, useState, useRef } from "react"
import getRequestedHeader from "../../utils/util"
import { IoLogOut } from "react-icons/io5";
import { useAuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoChatboxEllipses } from "react-icons/io5";
import './HomePage.css'
import moment from "moment";
import { useSocketContext } from "../../Context/SocketContext";

const HomePage = () => {
    const headers = getRequestedHeader()
    const [users, setUsers] = useState([])
    const [loggedInUserData, setLoggedInUserData] = useState({})
    const [selectedUser, setSelectedUser] = useState()
    const [inputMessage, setInputMessage] = useState()
    const [messages, setMessages] = useState()
    const navigate = useNavigate()

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
        axios.get(`https://chatapp-3rqf.onrender.com/api/message/getmessages/${selectedUser?._id}`, headers).then((res)=>{
            if(res?.data?.success){
                setMessages(res?.data?.result)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    const fetchUsers = async () => {
        axios.get('https://chatapp-3rqf.onrender.com/api/user/allUsers', headers).then((res)=>{
            if(res?.data?.success){
                setUsers(res?.data?.results)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    const fetchLoggedInUserData = async () => {
        axios.get('https://chatapp-3rqf.onrender.com/api/auth/getUserData', headers).then((res)=>{
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
            axios.post(`https://chatapp-3rqf.onrender.com/api/message/send/${selectedUser?._id}`, payload, headers).then((res)=>{
                if(res?.data?.success){
                    setInputMessage('')
                }
            }).catch((err)=>{
                alert("Errror")
            })
        }
    }

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
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center'}} key={index} className={selectedUser?._id === user?._id ? 'selected-chat' : ''} onClick={()=> setSelectedUser(user)}>
                                    <img src={user?.profilePic} width={60} height={60} style={{padding:'10px'}}></img>
                                    <div style={{display:'flex', flexDirection:'column', paddingLeft: '10px', alignItems:'start'}}>
                                        <p style={{fontSize:'25px', fontWeight:'normal'}}>{user?.name}</p>
                                        <p style={{fontSize:'15px'}}>{ onlineUsers?.includes(user._id) ? '🟢 Online' : '🔴 Offline' } </p>
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
            { !selectedUser ?
                <div>
                    <h1>Hi {loggedInUserData?.name} Welcome to the Chat App!</h1>
                    <p style={{fontSize:'25px'}}>Select a message to start messaging</p>
                    <IoChatboxEllipses style={{fontSize: '100px'}}/>

                </div>
                :
                <div style={{height: '100vh', width:'70vw', alignItems:'start', display:'flex',justifyContent:'end', flexDirection:'column'}}>
                    <div style={{width:'60vw', background:'#8599FF', justifyContent:'start', display:'flex', height:'130px', alignItems:'center'}}>
                        <p style={{padding:'20px', fontSize:'20px'}}>To : {selectedUser?.name}</p>
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