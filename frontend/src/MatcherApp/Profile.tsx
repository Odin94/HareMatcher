import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../GlobalConfig";

export default function Profile() {
    const [profileData, setProfileData] = useState(new ProfileData("", "", -1));
    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/profile`, {
            credentials: 'include',
        })
            .then(response => response.json())
            .then(json => {
                console.log(json);
                setProfileData(new ProfileData(json.name, json.email, json.id))
            })
            .catch(err => {
                alert(err);
            })
    }, [])


    return (
        <div>
            <h1>{profileData.name}</h1>
            <p>This user has not set up their profile properly yet</p>
        </div>
    )
}

class ProfileData {
    constructor(public name: string, public email: string, public id: number) { }
}