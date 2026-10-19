import { useState } from 'react';
import Axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';

function Register() {
    const [inputs, setInputs] = useState({
        userName: "",
        email: "",
        password: "",
        cpassword: ""
    });
    const navigate = useNavigate();

    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputs.password !== inputs.cpassword) {
            alert("Password mismatch");
        } else {
            try {
                const response = await Axios.post('http://localhost:3000/authen/register', inputs);
                if (response.status === 201) {
                    alert(response.data.message);
                    navigate('/login');
                }
            } catch (err) {
                if (err.response && err.response.status === 409) {
                    alert(err.response.data.message);
                } else {
                    alert("Registration failed");
                }
            }
            setInputs({
                userName: "",
                email: "",
                password: "",
                cpassword: ""
            });
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Register</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <input
                            type="text"
                            name="userName"
                            className="auth-input"
                            placeholder="Username"
                            value={inputs.userName || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="email"
                            name="email"
                            className="auth-input"
                            placeholder="Email"
                            value={inputs.email || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="password"
                            name="password"
                            className="auth-input"
                            placeholder="Password"
                            value={inputs.password || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                        <input
                            type="password"
                            name="cpassword"
                            className="auth-input"
                            placeholder="Confirm Password"
                            value={inputs.cpassword || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-btn">
                        Sign Up
                    </button>
                    <div className="auth-footer">
                        Have an Account ? <Link to="/login">Login Here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
