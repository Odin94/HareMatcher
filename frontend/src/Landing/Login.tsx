import React, { FormEvent } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useInput } from '../CustomHooks';
import { baseUrl, apiVersion } from '../GlobalConfig';
import { useHistory } from "react-router-dom";

export default function Login() {
    const history = useHistory();
    const { value: email, bind: bindEmail, reset: resetEmail } = useInput('');
    const { value: password, bind: bindPassword, reset: resetPassword } = useInput('');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        let formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        fetch(`${baseUrl}/api/${apiVersion}/login`, {
            method: "POST",
            body: formData,
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
            })
            .then(() => history.push("/profile"))
            .catch(err => alert(err))
    }

    return (
        <div className="container">
            <div className="px-4 py-5 my-5 text-center">
                <h1 className="display-5 fw-bold">Hare Matcher - Log in</h1>
            </div>
            {/*<div th:if="${(error != '')}">
                <div th:if="${(error == 'other')}">
                    Unknown error, please try again
                </div>
                <div th:if="${(error == 'invalid')}">
                    Invalid credentials
                </div>
                <div th:if="${(error == 'nocredentials')}">
                    Please enter credentials
                </div>
                <br>
 </div> */}

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