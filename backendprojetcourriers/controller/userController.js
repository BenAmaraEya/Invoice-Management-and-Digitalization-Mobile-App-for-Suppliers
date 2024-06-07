const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');
const axios=require ('axios');
const { Op } = require('sequelize');
const User = require("../models/User");
const Fournisseur=require("../models/Fournisseur");
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eyabenamara288@gmail.com',
        pass: 'pgaw wcnc ymux oeqs'
    },
    tls: {
        rejectUnauthorized: false 
    }
});
// fonction pour récupérer l'addresse public de l'utilisateur 
async function getPublicIP() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        const publicIP = response.data.ip;
        return publicIP;
    } catch (error) {
        console.error('Error getting public IP:', error);
        return null;
    }
}

const UserController = {
    login: async (req, res, next) => {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ where: { username } });

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            user.isactive = true;
            user.last_login = new Date();
            await user.save();

            const token = generateToken(user);

            // récupérer token et id 
            res.json({ token, id: user.id ,profil:user.profil});

            // récupérer l'ip et la localisation 
            const publicIP = await getPublicIP();
            const locationData = await axios.get(`https://ipinfo.io/${publicIP}/json`);
            const location = locationData.data;

            // Send login alert email
            await UserController.sendLoginAlertEmail(user, location);
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'erreur interne de serveur' });
        }
    },
   
    sendLoginAlertEmail: async (user, location) => {
        //definit les options de l'email
        const mailOptions = {
            from: 'eyabenamara288@gmail.com',
            to: user.email,
            subject: 'Login Alert',
            text: `Hello ${user.username},\n\nYou have logged in at ${new Date()} from ${location.city}, ${location.region}, ${location.country}.`
        };
        //envoyer l 'email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    },

    getUser: async (req, res, next) => {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
        }
    },
    checkadmin: async (req, res, next) => {
        const { password } = req.params;
        const { profil } = req.query;
    
        try {
           
            if (!profil) {
                return res.status(400).json({ error: 'Profil is required' });
            }
    
           
            const user = await User.findOne({ where: { profil, password } });
    
          
            if (!user || user.profil !== 'admin') {
                return res.status(401).json({ error: 'Unauthorized' }); 
            }
    
           
            return res.json({ isAdmin: true });
        } catch (error) {
            console.error('Error checking admin password:', error);
            return res.status(500).json({ error: 'erreur interne de serveur' });
        }
    },
    getUserById: async (req, res, next) => {
        const id = req.params.id;
        try {
            const user = await User.findOne({
                where: { id }
            });
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'utilisateur non trouvé' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la récupération du utilisateur' });
        }
    },

    adduser: async (req, res, next) => {
        try {
            const { name, username, email, phone, profil } = req.body;
            
            const password = username;
            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                name,
                username,
                email,
                phone,
                profil,
                password: passwordHash,
                isActive: false
            });

            res.status(201).json({ message: 'User added successfully', user: newUser });
        } catch (error) {
            console.error('Error adding user:', error);
            res.status(500).json({ error: 'erreur interne de serveur' });
        }
    },

    updateUser: async (req, res, next) => {
        const id = req.params.id;
        try {
            const [updatedRows] = await User.update(req.body, {
                where: { id }
            });

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'erreur interne de serveur' });
        }
    },
    deleteUser: async (req, res) => {
        const id = req.params.id;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'user not found' });
            }
            await user.destroy();
            res.json({ message: 'User deleted successfully' });

        }catch (error) {
            console.error('Error delete user:', error);
            res.status(500).json({ error: 'erreur interne de serveur' });
        }
    },

    logout: async (req, res, next) => {
        try {
            const id = req.params.id;
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.isactive = false;
            await user.save();

            res.status(200).json({ message: 'User logged out successfully' });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({ error: 'erreur interne de serveur' });
        }
    },

    access: async (req, res, next) => {
        const userId = req.params.id;
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const mailOptions = {
                from: 'eyabenamara288@gmail.com',
                to: user.email,
                subject: 'Your Login Credentials for the System',
                html: `
                    <p>Dear ${user.name},</p>
                    <p>Here are your temporary login credentials for the system:</p>
                    <p>Username: ${user.username}</p>
                    <p>Password: ${user.username} </p>
                    <p>Please change your password after logging in for security reasons.</p>
                    <p>Regards,</p>
                    <p>Your System</p>
                `
            };
            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: 'Login credentials sent successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'erreur interne de serveur' });
        }
    },
recherche: async (req, res, next) => {
        try {
            const name = req.query.name; 
            const users = await User.findAll({
                where: {
                    name: {
                        [Op.like]: `%${name}%`
                    }
                }
            });
            console.log(users);
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur de serveur');
        }
    },
    /*updatePassword: async (req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await User.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const passwordhash = await bcrypt.hash(req.body.password, 10);
            await user.update({ password: passwordhash }, { where: { id: userId } });
            res.json({ message: ' updated successfully' });
        } catch (error) {
            console.error('Error updating :', error);
            res.status(500).json({ error: 'erreur interne de serveur' });
        }
    },*/
    
    updatePassword: async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        /*if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }*/
        // Vérifiez si l'ancien mot de passe fourni correspond au mot de passe actuel de l'utilisateur
        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Old password is incorrect' });
        }

        // Générez le hash du nouveau mot de passe
        const newPasswordHash = await bcrypt.hash(req.body.newPassword, 10);

        // Mettre à jour le mot de passe de l'utilisateur
        await user.update({ password: newPasswordHash }, { where: { id: userId } });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'erreur interne de serveur' });
    }
},


};


module.exports = UserController;
