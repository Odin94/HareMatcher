import { profile } from 'console';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiVersion, baseUrl, hashCode } from '../Globals';
import '../index.css';
import { ProfileData, UserData } from "../Types";

const User: React.FC<UserProps> = ({ user, fetchError }) => {
    const navigate = useNavigate();

    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/users/${user.id}/profiles`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then((profiles: ProfileData[]) => {
                setProfiles(profiles.map(profile => ProfileData.fromJson(profile)));
            })
            .catch((err: Error) => { console.log(`error when fetching ${err}`) })
    }, [user]);

    return (
        <div>
            {fetchError
                ? <h1>{fetchError}</h1>
                : <div className="container container-xxl" style={{ margin: "0 auto" }}>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <h1 className="card-header">{user.name}</h1>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col d-flex flex-column justify-content-center">{user.description.split("\n\n").map((paragraph) => (
                                            <p key={hashCode(paragraph)} style={{ fontSize: "1.23rem" }}>{paragraph}</p>
                                        ))}
                                        </div>
                                        <div className="col"><img src={user.picture} alt={`Picture of user ${user.name}`} width="100%" height="500px" style={{ padding: "5px", objectFit: "cover", maxWidth: "900px" }}></img></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Card style={{ marginTop: "20px" }}>
                        <Card.Header>Profiles</Card.Header>
                        <Card.Body>
                            {profiles?.map((profile) => (
                                <Row key={profile.id}>
                                    <Col>
                                        <Card onClick={() => navigate(`/profiles/${profile.id}`)}>
                                            <Card.Body style={{ cursor: "pointer" }}>
                                                <Row>
                                                    <Col xs={2}><img src={profile.profilePictures?.at(0)?.picture || ""} width="70px" height="70px" className="rounded-circle float-start" /></Col>
                                                    <Col style={{ textAlign: "center" }}><h1>{profile.name}</h1></Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col></Col>
                                </Row>
                            ))}
                            {user.isMe
                                ? <Row>
                                    <Col>
                                        <Card>
                                            <Card.Body>
                                                <div style={{ textAlign: "center" }}><Button size="lg" variant="success" onClick={() => navigate("/profiles/create")}>Add Profile</Button></div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col></Col>
                                </Row>
                                : <div></div>
                            }
                        </Card.Body>
                    </Card>
                </div>
            }
        </div>
    )
}

export interface UserProps {
    user: UserData,
    fetchError?: string
}


export default User;