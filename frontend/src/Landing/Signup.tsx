import { FormEvent } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useInput } from "../CustomHooks";
import { baseUrl, apiVersion } from '../Globals';


export default function Signup() {
    const navigate = useNavigate();

    const { value: email, bind: bindEmail, reset: resetEmail } = useInput('');
    const { value: name, bind: bindName, reset: resetName } = useInput('');
    const { value: password, bind: bindPassword, reset: resetPassword } = useInput('');

    const login = () => {
        let formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        fetch(`http://${baseUrl}/api/${apiVersion}/login`, {
            method: "POST",
            body: formData,
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
            })
            .then(() => navigate("/me", { replace: false }))
            .catch(err => console.log(err))
    }

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        fetch(`http://${baseUrl}/api/${apiVersion}/users`, {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(json => console.log(JSON.stringify(json)))
            .then(() => login())
            .catch((err: Error) => {
                console.log(`error when posting: ${err}`);
            })
    }

    return (
        <div className="container">
            <div className="px-4 py-5 my-5 text-center">
                <h1 className="display-5 fw-bold">Hare Matcher - Sign up</h1>
            </div>

            <Form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">
                        Email address
                        <input aria-describedby="emailHelp" className="form-control" type="email" {...bindEmail} />
                        <div className="form-text" id="emailHelp">We'll never share your email with anyone else.</div>
                    </label>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Name
                        <input className="form-control" type="text" {...bindName} />
                    </label>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Password
                        <input className="form-control" type="password" {...bindPassword} />
                    </label>
                </div>

                <Button variant="primary" type="submit">Submit</Button>
            </Form>
        </div >
    )
}