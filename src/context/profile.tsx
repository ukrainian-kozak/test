import React, { createContext, useContext, useEffect, useState } from "react";

import { WebSocketContext } from "../context/socet";
import { sendMessage } from "../ws/events";
import { useTelegram } from "../components/hooks/useTelegram";
import { UserData } from "../typings";
import { useTonConnect } from "../components/hooks/useTonConnect";

interface UserProviderProps {
  children: React.ReactNode;
}

interface UserContextType {
  user: UserData;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData>(null);
  const { userData, needCreate, readyState, isLoading, send } = useContext(WebSocketContext);

  const { tg } = useTelegram();
  const { wallet, connected } = useTonConnect();

  useEffect(() => {
    const fetchData = () => {
      if (needCreate) {
        sendMessage('user', 'create', send, { init_data: tg.initData });
      } else if (!needCreate) {
        setUser(userData);
      }
    }

    fetchData();
  }, [userData, needCreate]);

  useEffect(() => {
    const fetchData = () => {
      if (readyState === WebSocket.OPEN) {
        if (connected ) {
          sendMessage('user', 'update', send, { 
            username: user.username, 
            wallet_addr: wallet 
          },);
        }
      }
    }

    fetchData();
}, [connected]);


  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};
