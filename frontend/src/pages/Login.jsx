import { useState } from 'react';
import Axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';

function Login() {
    const [inputs, setInputs] = useState({
        userName: "",
        password: ""
    });
    const navigate = useNavigate();

    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await Axios.post('http://localhost:3000/authen/login', inputs);
            if (response.status === 200) {
                alert(response.data.message);
                localStorage.setItem('token', response.data.token);
                navigate('/');
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                alert(err.response.data.message);
            } else {
                alert("Login failed");
            }
        }
        setInputs({ userName: "", password: "" });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Login</h1>
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
                            type="password"
                            name="password"
                            className="auth-input"
                            placeholder="Password"
                            value={inputs.password || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-btn">
                        ส่ง
                    </button>
                    <div className="auth-footer">
                        No Account ? <Link to="/register">Register Here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
