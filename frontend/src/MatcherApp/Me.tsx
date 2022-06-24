import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../Globals";
import "react-multi-carousel/lib/styles.css";
import 'react-image-lightbox/style.css';
import '../index.css';
import { UserData } from "../Types";
import User from "./User";


export default function Me() {
    const [user, setUser] = useState(new UserData(-1, "", "", "", "", [], [], true));
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/users/me`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setUser(UserData.fromJson(json));
            })
            .catch((err: Error) => {
                console.log(`error when fetching: ${err}`);
                setFetchError(err.message);
            })
    }, []);


    return (
        <div>
            <User user={user} fetchError={fetchError} />
        </div>
    )
}
