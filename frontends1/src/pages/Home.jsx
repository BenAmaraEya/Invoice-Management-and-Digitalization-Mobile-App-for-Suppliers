import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa"; // Importing user and lock icons
import "../styles/Home.css";

const Home = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.id]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3006/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const { token, id, profil } = data;

      // Store the token and user ID in local storage
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", id);
      localStorage.setItem("userProfil", profil);

      if (profil === "fournisseur") {
        navigate(`/dashboard/${id}`);
      } else if (profil === "bof" || profil === "personnelfiscalite" || profil === "agentTresorerie") {
        navigate(`/dashboardP/${id}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-page-background">
      <Container className="content-container">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md="6" className="login__container">
            <div className="login__header">
              <div className="login__icon"><FaUser /></div>
            </div>
            <Form onSubmit={handleLogin}>
              <FormGroup>
                <label className="labels" htmlFor="username"><FaUser /> Email ID</label>
                <input
                  type="text"
                  placeholder="Enter your email"
                  required
                  id="username"
                  onChange={handleInputChange}
                  className="custom-input"
                />
              </FormGroup>
              <FormGroup>
                <label className="labels"  htmlFor="password"><FaLock /> Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  id="password"
                  onChange={handleInputChange}
                  className="custom-input"
                />
              </FormGroup>
              <Button
                className="auth__btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="login__options">
                <input type="checkbox" id="rememberMe" /> <label htmlFor="rememberMe">Remember me</label>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>
            </Form>
            {error && <p className="error-message">{error}</p>}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
