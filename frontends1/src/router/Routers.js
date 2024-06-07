import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate,useParams } from "react-router-dom";
import Login from "./../pages/Login";
import Dashboard from "./../pages/Dashboard";
import Home from "./../pages/Home";
import ListUser from "./../pages/ListUser";
import AddUser from "./../pages/AddUser";
import UpdateFournisseur from "./../pages/UpdateFournisseur";
import Logout from "../pages/logout";
import UpdatePasswordForm from "../pages/updatePassword";
import UploadFacture from "../pages/UploadFacture";
import FactureForm from "../pages/FactureForm";
import PdfViewer from "../pages/PdfViewer";
import ListeFactures from "../pages/ListeFactures";
import UpdateFacture from "../pages/UpdateFacture";
import DashboardP from "../pages/personnelDCF/DashboardP";
import ListCourries from "../pages/personnelDCF/ListCourriers";
import ListFournisseur from "../pages/personnelDCF/ListFournisseur";
import Bordereau from "../pages/personnelDCF/BordereauList";
import UpdateUser from "./../pages/UpdateUser";
import UploadFact from "../pages/personnelDCF/UploadFact";
import ListFacturesByB from "../pages/personnelDCF/ListFactByB";
import ListeFacturesFiscalité from "../pages/personnelDCF/listCourriersFiscalite";
import ListeFacturesTresorerie from "../pages/personnelDCF/listCourriersTresorerie";
import ListSupplier from "../pages/ListSupplier";
import ReclamationForm from "../pages/reclamation";
import ReclamationDetails from "../pages/personnelDCF/reclamationbyid";
import ReclamationList from "../pages/ListReclamation";
import ArchiveList from "../pages/personnelDCF/Archive";
import DetailFacture from "../pages/personnelDCF/DetailFacture";
import Historique from "../pages/historique";
import Details from "../pages/Details";
import InfographicLine from "../pages/infographicline";

const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout/:id" element={<Logout />} />
            <Route path="/dashboard/:id" element={<Dashboard />} />
            <Route path="/listUser" element={<ListUser />} />
            <Route path="/listSupplier" element={<ListSupplier />} />
            <Route path="/admin/addUser/:password" element={<ProtectedAddUser />} />
            <Route path="/updateFournisseur/:iderp" element={<UpdateFournisseur />} />
            <Route path="/updatepass/:id" element={<UpdatePasswordForm />} />
            <Route path="/uploadfacture" element={<UploadFacture />} />
            <Route path="/facture-form" element={<FactureForm />} />
            <Route path="/pdf/:filename" element={<PdfViewer />} />
            <Route path="/factures/:id" element={<ListeFactures />} />
            <Route path="/updatefacture/:idF" element={<UpdateFacture />} />
            <Route path="/dashboardP/:id" element={<DashboardP />} />
            <Route path="/listcourriers/:iderp" element={<ListCourries />} />
            <Route path="/listfournisseur/:id" element={<ListFournisseur />} />
            <Route path="/bordereaux" element={<Bordereau />} />
            <Route path="/updateUser/:id" element={<UpdateUser />} />
            <Route path="/uploadFact" element={<UploadFact />} />
            <Route path="/fact/:idB" element={<ListFacturesByB />} />
            <Route path="/uploadFact/:nature" element={<UploadFact />} />
            <Route path="/listcourriersfiscal" element={<ListeFacturesFiscalité />} />
            <Route path="/listcourrierstresorerie" element={<ListeFacturesTresorerie />} />
            <Route path="/reclamation/:id" element={<ReclamationForm />} />
            <Route path="/reclam/:id" element={<ReclamationDetails />} />
            <Route path="/listreclamation/:id" element={<ReclamationList />} />
            <Route path="/listArchive" element={<ArchiveList />} />
            <Route path="/detailsFacture/:idF" element={<DetailFacture />} />
            <Route path="/historique/:id" element={<Historique />} />
            <Route path="/details/:idF" element={<Details />} />
            <Route path="infographic/:idF" element={<InfographicLine/>}/>
        </Routes>
    );
};

const ProtectedAddUser = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { password } = useParams(); // Import useParams to access route parameters

    useEffect(() => {
        const fetchAdminPassword = async () => {
            try {
                const response = await fetch(`http://localhost:3006/user/check/${password}?profil=admin`);
                if (!response.ok) {
                    throw new Error("Failed to fetch admin password");
                }
                const data = await response.json();
                setIsAdmin(data.isAdmin);
                setLoading(false);
                if (!data.isAdmin) {
                    navigate('/home');
                }
            } catch (error) {
                console.error("Error fetching admin password:", error);
                setLoading(false);
            }
        };

        fetchAdminPassword();
    }, [navigate, password]); // Add password to the dependency array

    if (loading) {
        return <div>Loading...</div>;
    }

    // Render AddUser component if user is an admin
    return isAdmin ? <AddUser /> : <Navigate to="/home" />;
};

export default Routers;

