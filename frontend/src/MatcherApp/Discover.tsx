import { useEffect } from "react";
import { Spinner } from "react-bootstrap";
import 'react-image-lightbox/style.css';
import "react-multi-carousel/lib/styles.css";
import { useQuery } from "react-query";
import { apiVersion, baseUrl } from "../Globals";
import '../index.css';
import { Profile, profileSchema } from "../Types";
import ProfilePage from "./ProfilePage";


export default function Discover() {
    const { isLoading, error, data } = useQuery("discover", () => discoverProfile(), {
        retry: (_count: number, error: unknown) => {
            if (error instanceof Error) {
                // 404 means no more profiles to discover
                return error.message !== "404: Not Found"
            }
            return true
        }
    })

    const discoverProfile = (): Promise<Profile> => {
        return fetch(`http://${baseUrl}/api/${apiVersion}/discover`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
                return response.json()
            })
            .then(json => profileSchema.validateSync(json))
    }

    useEffect(() => {
        discoverProfile()
    }, []);


    if (isLoading) {
        return (<Spinner animation="border" variant="success"></Spinner>)
    }

    if (error) {
        if (error instanceof Error) {
            if (error.message === "404: Not Found") {
                return (<div className="container container-xxl" style={{ margin: "0 auto" }}>
                    <div className="card">
                        <div className="card-body">
                            <h1>No more profiles to discover</h1>
                            <p>Please come back later or consider changing your search preferences</p>
                        </div>
                    </div>
                </div>)
            }
        }
        return (<h1>{`Error: ${error}`}</h1>)
    }

    if (!data) {
        throw new Error("where profile data?")
    }
    return (

        <ProfilePage profileId={data.id} onSwipeComplete={() => discoverProfile()} />
    )
}

