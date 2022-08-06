import { FormEvent, useState } from "react";
import { Badge, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useInput } from "../CustomHooks";
import { apiVersion, baseUrl } from '../Globals';


export default function Signup() {
    const navigate = useNavigate();

    const [fetchError, setFetchError] = useState("");

    const { value: email, bind: bindEmail } = useInput('');
    const { value: name, bind: bindName } = useInput('');
    const { value: password, bind: bindPassword } = useInput('');

    const login = () => {
        const formData = new FormData();
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
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => console.log(JSON.stringify(json)))
            .then(() => login())
            .catch((err: Error) => {
                setFetchError(err.message);
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
                        <span>
                            <input aria-describedby="emailHelp" className="form-control" type="email" {...bindEmail} />
                            {fetchError === "409: Conflict" && <Badge bg="danger">Email already used</Badge>}
                        </span>
                        <div className="form-text" id="emailHelp">We will never share your email with anyone else.</div>
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