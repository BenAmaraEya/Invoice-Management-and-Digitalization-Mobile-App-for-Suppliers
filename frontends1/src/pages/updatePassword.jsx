import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './../styles/updatepassword.css'; 

const UpdatePasswordForm = () => {
    
        const [formData, setFormData] = useState({
            oldPassword: "",
            newPassword: ""
        });
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(false);
        const { id } = useParams();
    
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
    
            try {
                const response = await axios.put(`http://localhost:3006/user/updatePass/${id}`, formData);
    
                if (response.status !== 200) {
                    throw new Error("Failed to update password");
                }
    
                
                window.alert('Password updated successfully');
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    return (
        <div className="update-password-card">
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="oldPassword">Old Password</label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" disabled={loading}>Update Password</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default UpdatePasswordForm;
