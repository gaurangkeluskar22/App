import axios from "axios"
import { useEffect, useState } from "react"
import getRequestedHeader from "../../utils/util"
import { IoLogOut } from "react-icons/io5";
import { useAuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoChatboxEllipses } from "react-icons/io5";
import './HomePage.css'

const HomePage = () => {
    const headers = getRequestedHeader()
    const [users, setUsers] = useState([])
    const [loggedInUserData, setLoggedInUserData] = useState({})
    const [selectedId, setSelectedId] = useState()
    const navigate = useNavigate()

    const {authUser, setAuthUser} = useAuthContext()

    useEffect(()=>{
        if(!authUser?.length){
            navigate('/login')
        }
    },[authUser])

    const fetchUsers = async () => {
        axios.get('http://localhost:9999/api/user/allUsers', headers).then((res)=>{
            if(res?.data?.success){
                setUsers(res?.data?.results)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }

    const fetchLoggedInUserData = async () => {
        axios.get('http://localhost:9999/api/auth/getUserData', headers).then((res)=>{
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
    }

    return (
        <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{height:'100vh', width:'30vw', display:'flex', flexDirection:'column', overflow:'scroll'}}>
                <div style={{display:'flex', flexDirection:'row', padding:'5px', alignItems:'center', background:'#0C6BF6', justifyContent:'space-between'}}>
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
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center'}} key={index} className={selectedId === user?._id ? 'selected-chat' : ''} onClick={()=> setSelectedId(user?._id)}>
                                    <img src={user?.profilePic} width={60} height={60} style={{padding:'10px'}}></img>
                                    <div style={{display:'flex', flexDirection:'column', paddingLeft: '10px', alignItems:'start'}}>
                                        <p style={{fontSize:'25px', fontWeight:'normal'}}>{user?.name}</p>
                                        <p style={{fontSize:'15px'}}>🟢 Online</p>
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
            { !selectedId ?
                <div>
                    <h1>Hi {loggedInUserData?.name} Welcome to the Chat App!</h1>
                    <p style={{fontSize:'25px'}}>Select a message to start messaging</p>
                    <IoChatboxEllipses style={{fontSize: '100px'}}/>

                </div>
                :
                <div style={{height: '100vh', width:'70vw', alignItems:'start', display:'flex',justifyContent:'end', flexDirection:'column'}}>
                <div style={{display: 'flex', flexDirection:'column', width:'60vw', alignItems:'end', height:'130vh', background:'red', overflow:'scroll'}}>
                dgdsg 
                </div>
                <div style={{margin:'10px'}}>
                    <input type="text" className="chat-input"></input>
                    <button className="chat-send-button">Send</button>
                </div>
                </div>
            }
            </div>
            </>
            
        </div>
    )
}

export default HomePage