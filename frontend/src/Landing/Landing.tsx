import React from 'react';

export default function Landing() {
    return (
        <div className="px-4 py-5 my-5 text-center">
            <h1 className="display-5 fw-bold">Hare Matcher</h1>
            <div className="col-lg-6 mx-auto">
                <p className="lead mb-4">Quickly match with a cute rabbit to keep as a pet!</p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                    <a href="/signup">
                        <button className="btn btn-primary btn-lg px-4 gap-3" type="button">Sign up now</button>
                    </a>
                    <button className="btn btn-outline-secondary btn-lg px-4" type="button">Read more</button>
                </div>
            </div>
            <div style={{maxHeight: "30vh"}}>
                <div className="container px-5">
                    <img alt=""
                        className="img-fluid border rounded-3 shadow-lg" loading="lazy"
                        src="https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1934&q=80"
                        width="800" />
                </div>
            </div>
        </div>
    )
}
