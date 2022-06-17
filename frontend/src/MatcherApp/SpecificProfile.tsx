import { useEffect, useState } from "react";
import { useParams } from 'react-router';
import { apiVersion, baseUrl } from "../Globals";
import "react-multi-carousel/lib/styles.css";
import 'react-image-lightbox/style.css';
import '../index.css';
import { ProfileData } from "./Types";
import Profile from "./Profile";


export default function SpecificProfile() {
    const { id } = useParams();
    const [profileData, setProfileData] = useState(new ProfileData(-1, "", "", "", "", 0, 0, "", [], false, undefined));
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/profiles/${id}`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setProfileData(ProfileData.fromJson(json));
            })
            .catch((err: Error) => {
                console.log(`error when fetching: ${err}`);
                setFetchError(err.message);
            })
    }, []);


    return (
        <div>
            <Profile profile={profileData} fetchError={fetchError} />;
        </div>
    )
}
