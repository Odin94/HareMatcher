import { match } from "assert";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiVersion, baseUrl } from "../Globals";
import { ProfileData } from "../Types";

const defaultPictureSource = "https://images.unsplash.com/photo-1629898471270-d4f5f525b8dc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";

const defaultPictureSourceTwo = "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";

const defaultUserPicture = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";

const formattedDateToday = new Date().toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric"
});

export default function Matches() {
    const navigate = useNavigate();

    const testingProfilePreviews = [new ProfilePreview(0, defaultPictureSource, "Test One"), new ProfilePreview(1, defaultPictureSourceTwo, "Test Two"), new ProfilePreview(2, defaultPictureSourceTwo, "Test Three")];
    const testingMatches = [[new Match(-1, "TestUser", defaultUserPicture, formattedDateToday)], [new Match(-1, "TestUser", defaultUserPicture, formattedDateToday), new Match(-1, "TestUser", defaultUserPicture, formattedDateToday)], []];

    const [profilePreviewsWithMatches, setProfilePreviewsWithMatches] = useState(testingProfilePreviews.map((preview, i) => { return new ProfilePreviewWithMatch(preview, testingMatches[i]) }));
    const [selectedProfileWithMatches, setSelectedProfileWithMatches] = useState(new ProfilePreviewWithMatch(testingProfilePreviews[0], testingMatches[0]));

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/matches`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                const profilePreviewsWithMatches = json.map(({ profile, matches }: { profile: ProfileData, matches: Match[] }) => {
                    const thumbnail = profile.pictures?.find(picture => picture.index === 0)?.picture || defaultPictureSource
                    const preview = new ProfilePreview(profile.id, thumbnail, profile.name)

                    for (const match of matches) {
                        match.userPicture = `data:image/jpg;base64,${match.userPicture}`
                    }

                    return new ProfilePreviewWithMatch(preview, matches)
                });

                setProfilePreviewsWithMatches(profilePreviewsWithMatches);
                if (profilePreviewsWithMatches.length > 0) setSelectedProfileWithMatches(profilePreviewsWithMatches[0]);
            })
            .catch((err: Error) => {
                console.log(`error when fetching profiles: ${err}`);
            })
    }, []);

    return (
        <div>
            <div className="container container-xxl" style={{ margin: "0 auto" }}>
                <div className="row">
                    <div className="col-4">
                        {
                            profilePreviewsWithMatches.map((profileWithMatch) => (
                                <div key={profileWithMatch.profilePreview.id} className="row" style={{ cursor: "pointer" }} onClick={() => {
                                    setSelectedProfileWithMatches(profileWithMatch);
                                }}>
                                    <div className={`card${profileWithMatch.profilePreview.id === selectedProfileWithMatches.profilePreview.id ? " shadow-sm border border-success" : ""}`}>
                                        <div className="card-body">
                                            <div className="row justify-content-center align-items-center">
                                                <div className="col">
                                                    <img src={profileWithMatch.profilePreview.thumbnailBase64} width="70px" height="70px" className="rounded-circle float-start" />
                                                </div>
                                                <div className="col d-flex flex-column">
                                                    <h3>{profileWithMatch.profilePreview.name}</h3>
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
                                        ? <div><h4>{selectedProfileWithMatches.profilePreview.name} has no matches yet</h4></div>
                                        : selectedProfileWithMatches.matches.map((match, i) => (
                                            <div key={match.userName} className={`card${(i === 0) ? "" : " mt-1"}`}>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-2">
                                                            <img src={match.userPicture} width="70px" height="70px" className="rounded-circle float-start" />
                                                        </div>
                                                        <div className="col text-center">
                                                            <h1>
                                                                {match.userName}
                                                            </h1>
                                                            <p>{match.matchedOn}</p>
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
    constructor(public userId: number, public userName: string, public userPicture: string, public matchedOn: string) { }
}

class ProfilePreviewWithMatch {
    constructor(public profilePreview: ProfilePreview, public matches: Match[]) { }
}