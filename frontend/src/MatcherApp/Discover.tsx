import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../Globals";
import "react-multi-carousel/lib/styles.css";
import 'react-image-lightbox/style.css';
import '../index.css';
import { ProfileData } from "../Types";
import Profile from "./Profile";


export default function Discover() {
    const [profileData, setProfileData] = useState(new ProfileData(-1, "", "", "", "", 0, 0, "", [], false, undefined));
    const [fetchError, setFetchError] = useState("");

    const discoverProfile = async () => {
        fetch(`${baseUrl}/api/${apiVersion}/discover`, {
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
    }

    useEffect(() => {
        discoverProfile()
    }, []);


    return (
        <div>
            {fetchError === "404: Not Found"
                ? <div className="container" style={{ width: "50%", margin: "0 auto" }}>
                    <div className="card">
                        <div className="card-body">
                            <h1>No more profiles to discover</h1>
                            <p>Please come back later or consider changing your search preferences</p>
                        </div>
                    </div>
                </div>
                : <Profile profile={profileData} fetchError={fetchError} onSwipeComplete={() => discoverProfile()} />
            }
        </div>
    )
}

