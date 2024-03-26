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
    const {userId} = useAuthContext()

    useEffect(()=>{
        if(userId){
            //https://chatapp-3rqf.onrender.com
            const socket = io("http://localhost:9999",{
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
    },[userId])

    return(<SocketContext.Provider value={{socket, onlineUsers}}>{children}</SocketContext.Provider>)
}
