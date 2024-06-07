import React, { useState, useEffect } from "react";
import { NavLink, useNavigate ,Link} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faSignOutAlt, faCog, faBell } from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import logo from '../../assets/images/TTlogo.png';
import io from 'socket.io-client';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import NotificationBadge, { Effect } from 'react-notification-badge';

import { Button } from 'reactstrap';
const Header = () => {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const userProfile = localStorage.getItem("userProfil");
  const [isBordereauMenuOpen, setIsBordereauMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [fournisseur, setFournisseur] = useState([]);
  const [user, setUser] = useState({});
  const [iderp,setIdErp]=useState(null);
  /*useEffect(() => {
    const fetchFournisseurById = async () => {
      try {
        const id = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:3006/fournisseur/userId/${id}`);
        const iderpFromResponse = response.data.fournisseur.iderp;
        setIdErp(iderpFromResponse);
      } catch (error) {
        console.error('Error fetching fournisseur:', error);
      }
    };

    fetchFournisseurById();
  }, []);*/
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const response = await axios.get(`http://localhost:3006/user/${userId}`);
            setUser(response.data);
        } catch (error) {
            
            console.error('Error fetching user:', error);
        }
    };

    fetchUser();
}, [userId]);

  useEffect(() => {
    
    const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(storedNotifications);
    const socket = io('http://localhost:3006');
    socket.on('newReclamation', async (reclamation) => {
      try {
       

        // Add new notification to the array
        const newNotification = {
          id: reclamation.id,
          message: `Nouvelle réclamation`
        };
        setNotifications(prevNotifications => {
          const updatedNotifications = [...prevNotifications, newNotification];
          localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
      } catch (error) {
        console.error("Error fetching fournisseur:", error);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleToggleBordereauMenu = () => {
    setIsBordereauMenuOpen(!isBordereauMenuOpen);
  };

  const handleToggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleToggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
  };

  const handleNatureSelection = (nature) => {
    navigate('/uploadFact/' + nature, { state: { nature } });
    setIsBordereauMenuOpen(false); // Close the menu after selecting a nature
  };

  const handleUpdatePassword = () => {
    navigate(`/updatePass/${userId}`);
    setIsUserMenuOpen(false); // Close the menu after selecting an option
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`http://localhost:3006/auth/logout/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        console.log("Token removed");
        navigate('/home');
      } else {
        console.error("Failed to logout:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsUserMenuOpen(false);
  };
  const renderUserName = () => {
    if (user.User) {
        return user.User.name;
    } else {
        return user.name;
    }};
  return (
    <header className="header">
      
      <div className="navigation">
        <ul className="menu d-flex align-items-center gap-5">

         

          <li className="nav__item" style={{marginTop:'25px'}} >
            <NavLink to={`/dashboardP/${userId}`} style={{marginTop:'30px'}}activeClassName="active" exact>
              Dashboard
            </NavLink>
          </li>

         {userProfile === "personnelfiscalite" &&(
          <>
          <li className="nav__item" style={{marginTop:'25px'}} >
            <NavLink to={`/listcourriersfiscal`}style={{marginTop:'25px'}} activeClassName="active" exact>
              Factures
            </NavLink>
          </li>
         </>)}
         {userProfile === "agentTresorerie" &&(
          <>
          <li className="nav__item" style={{marginTop:'25px'}} >
            <NavLink to={`/listcourrierstresorerie`} style={{marginTop:'25px'}} activeClassName="active" exact>
              Factures
            </NavLink>
          </li>
         </>)}
          {userProfile === "bof" && (
            <>
             <li className="nav__item"style={{marginTop:'25px'}} >
            <NavLink to={`/listfournisseur/${userId}`}style={{marginTop:'25px'}} activeClassName="active" exact>
              Fournisseurs
            </NavLink>
          </li>
          <li className="nav__item bordereau-item">
  <div className="dropdown">
    <div className="dropdown-btn deposer-button" onClick={handleToggleBordereauMenu} style={{
        cursor: 'pointer',
        color: '#fff',
        textDecoration: 'none',
        padding: '10px 20px',
        borderRadius: '25px',
        position: 'relative',
        transition: 'background-color 0.3s ease, color 0.3s ease, border-radius 0.3s ease'
      }} activeClassName="active" exact>
      deposer
    </div>
    {isBordereauMenuOpen && (
      <div className="dropdown-content">
        <button className="dropdown-item" onClick={() => handleNatureSelection('3WMTND')}>
          TND
        </button>
        <button className="dropdown-item" onClick={() => handleNatureSelection('Nature2')}>
          Nature 2
        </button>
        <button className="dropdown-item" onClick={() => handleNatureSelection('Nature3')}>
          Nature 3
        </button>
      </div>
    )}
  </div>
</li>
              <li className="nav__item" style={{marginTop:'25px'}} >
                <NavLink to={`/bordereaux`}activeClassName="active" exact>
                  Bordereaux
                </NavLink>
              </li>
              <li className="nav__item" style={{marginTop:'25px'}} >
            <div className="dropdown">
              <div className="dropdown-btn" onClick={handleToggleNotificationMenu}>
                
              <FontAwesomeIcon icon={faBell} className="notif-icon" />
              {notifications.length > 0 && (
      <div className="notification-badge-container">
      <NotificationBadge count={notifications.length} effect={Effect.SCALE} />
    </div>
    )}
              
              </div>
              {isNotificationMenuOpen && (
                <div className="dropdown-content">
                  {notifications.length === 0 ? (
                    <div>Pas de nouveau notification</div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} onClick={() => {
                        navigate(`/reclam/${notification.id}`);
                        NotificationManager.info(notification.message);
                        setNotifications(notifications.filter(n => n.id !== notification.id));
                        localStorage.setItem("notifications", JSON.stringify(notifications.filter(n => n.id !== notification.id)));
                      }} className="notification-item">
                        {notification.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </li>
            </>
          )}

          <li className="nav__item user-settings-item">
            <div className="dropdown" style={{marginTop:'25px'}} >
              <div className="dropdown-btn" onClick={handleToggleUserMenu}>
                <FontAwesomeIcon icon={faCog} className="icon" />
              </div>
              {isUserMenuOpen && (
                <div className="dropdown-content">
                  <button className="dropdown-item" onClick={handleUpdatePassword}>
                    Update Password
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                 
  <Link to={`/listArchive`} className="nav__link">
    <Button  className="listarchivebtn">Liste Archive</Button>
  </Link>

                  
                </div>
              )}
            </div>
          </li>
          <li style={{marginTop:'25px',marginLeft:'300px',color:'white', fontWeight:'bold'}}>
          <div className="user-name">Nom : {renderUserName()}</div>
          {userProfile && <span>Profile : {userProfile}</span>}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
