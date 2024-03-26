import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";


export const SocketContext = createContext()

export const useSocketContext = () => {
    return useContext(SocketContext)
}

export const SocketContextProvider = ({children}) => {
    const [socket, setSocket] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const {authUser, userId} = useAuthContext()

    useEffect(()=>{
        if(authUser){
            const socket = io("https://chatapp-3rqf.onrender.com",{
                query:{
                    userId : userId
                }
            })
            setSocket(socket)

            socket.on("getOnlineUsers", (users)=>{
                setOnlineUsers(users)
            })

            return () => socket.close()
        }else{
            if(socket){
                socket.close()
                setSocket(null)
            }
        }
    },[authUser, userId])

    return(<SocketContext.Provider value={{socket, onlineUsers}}>{children}</SocketContext.Provider>)
}
