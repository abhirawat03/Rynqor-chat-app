import { createContext, useContext } from "react";
const SocketContext = createContext(null);

export const SocketProviderContext = ({ value, children }) => {
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    return useContext(SocketContext);
};