// import useContext to be able to connect to a context file
import { useState, useContext } from "react"
import axios from "axios"

// To use context, first import the context file. 
import AuthContext from "../store/authContext"

const Auth = () => {
    const [register, setRegister] = useState(true)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [display, setDisplay] = useState("none")

    // invoke useContext and pass in the context we want to connect to, then assign the value of that invocation to a variable
    const authCtx = useContext(AuthContext)

    const submitHandler = e => {
        e.preventDefault()

        setDisplay("none")

        //put the username and password in a body object to be sent to server
        const body = {
            username,
            password
        }

        // const url = 'https://socialmtn.devmountain.com'
        // we want to send the request to my local computer at port 4545
        const url = "http://localhost:4545"
    

        // 1. Send a post request to the registor or login endpoints in the backend. 
        axios
            .post(register ? `/register` : `/login`, body)
            .then(res => {
                // 6. receive the response from the server with the user's info (indcluding token and expiration time)
                console.log("AFTER AUTH", res.data)
                // 7. invoke the login function in the context file and pass in the user's info. 
                authCtx.login(res.data.token, res.data.exp, res.data.userId)
            })
            .catch(err => {
                // 4.1 we receive the error code and inform the user that they could not register with that username as it is taken. 
                setMessage(err.response.data)
                setDisplay("block")
                setPassword("")
                setUsername("")
            })
    }

    return (
        <main>
            <h1>Welcome!</h1>
            <form className="form auth-form" onSubmit={submitHandler}>
                <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="form-input"
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input"
                />
                <button className="form-btn">
                    {register ? "Sign Up" : "Login"}
                </button>
            </form>
            <p style={{ display: display }} className="auth-msg">
                {message}
            </p>
            <button className="form-btn" onClick={() => setRegister(!register)}>
                Need to {register ? "Login" : "Sign Up"}?
            </button>
        </main>
    )
}

export default Auth
