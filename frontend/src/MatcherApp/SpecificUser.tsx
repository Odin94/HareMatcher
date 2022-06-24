import { useEffect, useState } from "react";
import { useParams } from 'react-router';
import { apiVersion, baseUrl } from "../Globals";
import "react-multi-carousel/lib/styles.css";
import 'react-image-lightbox/style.css';
import '../index.css';
import { UserData } from "../Types";
import User from "./User";


export default function SpecificUser() {
    const { id } = useParams();
    const [user, setUser] = useState(new UserData(-1, "", "", "", "", [], [], false));
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/users/${id}`, {
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
