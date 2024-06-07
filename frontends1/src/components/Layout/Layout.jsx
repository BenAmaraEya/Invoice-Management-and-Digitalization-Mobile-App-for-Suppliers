/*mport React from "react";
import Header from './../Header/Header';
import Routers from '../../router/Routers';
import Footer from './../Footer/Footer';

const Layout = () => {
    return (
        <>
            <Header />
            <Routers />
            <Footer />
        </>
    );
};

export default Layout;*/

import React ,{useContext} from "react";
import HomeHeader from './../Header/HomeHeader';
import PersonnelHeader from '../Header/PersonnelHeader';
import Header from './../Header/Header';
import Routers from '../../router/Routers';
import Footer from './../Footer/Footer';
import { useLocation } from 'react-router-dom';
import { useAuth } from "../../AuthContext";
const Layout = () => {
    const { userId } = useAuth();
    const location = useLocation();

    // Define a function to determine which header component to render based on the current route
    const renderHeader = () => {
        if (location.pathname === "/home") {
            return null;
        
        }else {
            // Check the user's profile from localStorage
            const userProfile = localStorage.getItem("userProfil");
           
            if (userProfile === "bof" || userProfile === "personnelfiscalite" || userProfile === "agentTresorerie") {
              return <PersonnelHeader />;
            } else {
              return <Header />;
            }
          }
        };

    return (
        <>
            {renderHeader()}
            <Routers />
           
        </>
    );
};

export default Layout;
