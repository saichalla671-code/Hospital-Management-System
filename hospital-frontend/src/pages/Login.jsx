import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // Check whether user is already logged in
    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const decodedToken = jwtDecode(token);

            const currentTime = Date.now() / 1000;

            if (decodedToken.exp > currentTime) {
                navigate("/dashboard", { replace: true });
            } else {
                localStorage.removeItem("token");
            }

        } catch (error) {

            localStorage.removeItem("token");

        }

    }, [navigate]);


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");


        // Validation

        if (!username.trim()) {
            setError("Please enter username");
            return;
        }

        if (!password.trim()) {
            setError("Please enter password");
            return;
        }


        try {

            setLoading(true);

            const response = await api.post("/users/login", {
                username: username,
                password: password
            });


            // Save JWT token

            localStorage.setItem(
                "token",
                response.data.token
            );


            // Go to dashboard

            navigate("/dashboard", {
                replace: true
            });


        } catch (error) {

            console.error(error);

            if (error.response) {

                if (error.response.status === 401) {

                    setError(
                        "Invalid username or password"
                    );

                } else {

                    setError(
                        error.response.data?.error ||
                        "Login failed"
                    );

                }

            } else {

                setError(
                    "Cannot connect to server. Please check whether Spring Boot is running."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div
            style={{
                width: "400px",
                margin: "100px auto",
                padding: "30px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
        >

            <h2 style={{ textAlign: "center" }}>
                Hospital Management System
            </h2>

            <h2 style={{ textAlign: "center" }}>
                Login
            </h2>


            <form onSubmit={handleLogin}>

                {/* Username */}

                <div style={{ marginBottom: "15px" }}>

                    <label>
                        Username
                    </label>

                    <br />

                    <input
                        type="text"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        placeholder="Enter username"
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>


                {/* Password */}

                <div style={{ marginBottom: "15px" }}>

                    <label>
                        Password
                    </label>

                    <br />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter password"
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>


                {/* Error */}

                {error && (

                    <p
                        style={{
                            color: "red",
                            backgroundColor: "#ffe6e6",
                            padding: "10px",
                            borderRadius: "5px"
                        }}
                    >
                        {error}
                    </p>

                )}


                {/* Login Button */}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        cursor: loading
                            ? "not-allowed"
                            : "pointer"
                    }}
                >

                    {loading
                        ? "Logging in..."
                        : "Login"}

                </button>

            </form>

        </div>

    );
}

export default Login;