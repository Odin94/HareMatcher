import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../GlobalConfig";

export default function Profile() {
    const [profileData, setProfileData] = useState(new ProfileData("", "", -1));
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/profile`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setProfileData(new ProfileData(json.name, json.email, json.id));
            })
            .catch((err: Error) => {
                console.log(`error when fetching: ${err}`);
                setFetchError(err.message);
            })
    }, [])

    return (
        <div>
            {fetchError
                ? <h1>{fetchError}</h1>
                : <div>
                    <h1>{profileData.name}</h1>
                    <p>This user has not set up their profile properly yet</p>
                </div>
            }
        </div>
    )
}

class ProfileData {
    constructor(public name: string, public email: string, public id: number) { }
}