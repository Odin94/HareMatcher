import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { apiVersion, baseUrl } from "../Globals";
import { ProfileData } from "../Types";

const defaultPictureSource = "https://images.unsplash.com/photo-1629898471270-d4f5f525b8dc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";

const defaultUserPicture = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=360&q=80";


export default function Matches() {
    const navigate = useNavigate();

    const initialProfilePreviewWithMatch = new ProfilePreviewWithMatch(new ProfilePreview(-1, defaultPictureSource, "Test One"), [new Match(-1, -1, "TestUser", defaultUserPicture, "")]);

    const [profilePreviewsWithMatches, setProfilePreviewsWithMatches] = useState([initialProfilePreviewWithMatch]);
    const [selectedProfileWithMatches, setSelectedProfileWithMatches] = useState<ProfilePreviewWithMatch | null>(initialProfilePreviewWithMatch);

    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/matches`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                const profilePreviewsWithMatches = json.map(({ profile, matches }: { profile: ProfileData, matches: Match[] }) => {
                    const thumbnail = profile.profilePictures?.find(picture => picture.index === 0)?.picture || defaultPictureSource
                    const preview = new ProfilePreview(profile.id, thumbnail, profile.name)

                    return new ProfilePreviewWithMatch(preview, matches)
                });

                setProfilePreviewsWithMatches(profilePreviewsWithMatches);
                if (profilePreviewsWithMatches.length > 0) setSelectedProfileWithMatches(profilePreviewsWithMatches[0]);
                else setSelectedProfileWithMatches(null);
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
                                    <div className={`card${profileWithMatch.profilePreview.id === selectedProfileWithMatches?.profilePreview.id ? " shadow-sm border border-success" : ""}`}>
                                        <div className="card-body">
                                            <div className="row justify-content-center align-items-center">
                                                {profileWithMatch.profilePreview.id === -1
                                                    ? <div>
                                                        <Spinner animation="border" variant="success"></Spinner>
                                                    </div>
                                                    : <div>
                                                        <div className="col">
                                                            <img src={profileWithMatch.profilePreview.thumbnailBase64} width="70px" height="70px" className="rounded-circle float-start" />
                                                        </div>
                                                        <div className="col d-flex flex-column">
                                                            <h3>{profileWithMatch.profilePreview.name}</h3>
                                                        </div>
                                                    </div>
                                                }
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
                                    selectedProfileWithMatches?.matches.length === 0
                                        ? <div><h4>{selectedProfileWithMatches.profilePreview.name} has no matches yet</h4></div>
                                        : selectedProfileWithMatches?.matches.map((match, i) => (
                                            <div key={match.userId} className={`card${(i === 0) ? "" : " mt-1"}`} style={{ cursor: "pointer" }} onClick={() => {
                                                if (match.userId !== -1) {
                                                    navigate(`/users/${match.userId}`, { replace: false })
                                                }
                                            }}>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-2">
                                                            <img src={match.userPicture} width="70px" height="70px" className="rounded-circle float-start" />
                                                        </div>
                                                        <div className="col text-center">
                                                            {match.userId === -1
                                                                ? <div>
                                                                    <Spinner animation="border" variant="success"></Spinner>
                                                                </div>
                                                                : <div>
                                                                    <h1>{match.userName}</h1>
                                                                    <p>{match.matchedOn}</p>
                                                                    <Button onClick={(e: React.MouseEvent) => {
                                                                        if (match.userId !== -1) {
                                                                            e.stopPropagation();
                                                                            navigate(`/chat/${match.userId}/${match.profileId}`, { replace: false });
                                                                        }
                                                                    }} variant="success">Chat</Button>
                                                                </div>
                                                            }
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
    constructor(public userId: number, public profileId: number, public userName: string, public userPicture: string, public matchedOn: string) { }
}

class ProfilePreviewWithMatch {
    constructor(public profilePreview: ProfilePreview, public matches: Match[]) { }
}