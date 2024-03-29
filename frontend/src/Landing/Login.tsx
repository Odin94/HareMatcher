import { FormEvent, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { useInput } from '../CustomHooks';
import { apiVersion, baseUrl } from '../Globals';

export default function Login() {
    const navigate = useNavigate();
    const { value: email, bind: bindEmail } = useInput('');
    const { value: password, bind: bindPassword } = useInput('');

    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/users/me`, {
            credentials: 'include',
        })
            .then(response => { if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`) })
            .then(() => { navigate("/me") })
            .catch((_err: Error) => { })
    }, []);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

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
            .then(() => navigate("/me", { replace: true }))
            .catch(err => alert(err))
    }

    return (
        <div className="container">
            <div className="px-4 py-5 my-5 text-center">
                <h1 className="display-5 fw-bold">Hare Matcher - Log in</h1>
            </div>

            <Form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">
                        Email address
                        <input className="form-control" type="email" {...bindEmail} />
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
        </div>
    )
}