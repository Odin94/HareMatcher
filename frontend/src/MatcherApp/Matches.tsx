import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../Globals";

const defaultPictureSource = "https://images.unsplash.com/photo-1629898471270-d4f5f525b8dc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";

const defaultPictureSourceTwo = "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";

const defaultUserPicture = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";

export default function Matches() {
    const testingProfilePreviews = [new ProfilePreview(0, defaultPictureSource, "Test One"), new ProfilePreview(1, defaultPictureSourceTwo, "Test Two"), new ProfilePreview(2, defaultPictureSourceTwo, "Test Three")];
    const testingMatches = [[new Match({ name: "TestUser" }, new Date())], [new Match({ name: "TestUser" }, new Date()), new Match({ name: "TastUser" }, new Date())], []];

    const [profilePreviews, setProfilePreviews] = useState(testingProfilePreviews);
    const [selectedProfileWithMatches, setSelectedProfileWithMatches] = useState(new SelectedProfileWithMatches(testingProfilePreviews[0], testingMatches[0]));

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/profiles`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setProfilePreviews([]);
            })
            .catch((err: Error) => {
                console.log(`error when fetching: ${err}`);
            })
    }, []);

    return (
        <div>
            <div className="container" style={{ width: "80%", margin: "0 auto" }}>
                <div className="row">
                    <div className="col-4">
                        {
                            profilePreviews.map((preview) => (
                                <div key={preview.id} className="row" style={{ cursor: "pointer" }} onClick={() => {
                                    setSelectedProfileWithMatches(new SelectedProfileWithMatches(preview, testingMatches[preview.id]))
                                }}>
                                    <div className={`card${preview.id === selectedProfileWithMatches.selectedProfilePreview.id ? " shadow-sm border border-success" : ""}`}>
                                        <div className="card-body">
                                            <div className="row justify-content-center align-items-center">
                                                <div className="col">
                                                    <img src={preview.thumbnailBase64} width="70px" height="70px" className="rounded-circle float-start" />
                                                </div>
                                                <div className="col d-flex flex-column">
                                                    <h3>{preview.name}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="col-1"></div>
                    <div className="col">
                        <div className="row">
                            <div className="col-10">
                                {
                                    selectedProfileWithMatches.matches.length === 0
                                        ? <div><h4>{selectedProfileWithMatches.selectedProfilePreview.name} has no matches yet</h4></div>
                                        : selectedProfileWithMatches.matches.map((match, i) => (
                                            <div key={match.matchingUser.name} className={`card${(i === 0) ? "" : " mt-1"}`}>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-2">
                                                            <img src={defaultUserPicture} width="70px" height="70px" className="rounded-circle float-start" />
                                                        </div>
                                                        <div className="col text-center">
                                                            <h1>
                                                                {match.matchingUser.name}
                                                            </h1>
                                                            <p>{match.matchedOn.toLocaleDateString("de-DE", {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric"
                                                            })}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

class ProfilePreview {
    constructor(public id: number, public thumbnailBase64: string, public name: string) { }
}

class Match {
    constructor(public matchingUser: { name: string }, public matchedOn: Date) { }
}

class SelectedProfileWithMatches {
    constructor(public selectedProfilePreview: ProfilePreview, public matches: Match[]) { }
}