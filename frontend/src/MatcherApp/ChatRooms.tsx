import { useEffect, useState } from "react";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { apiVersion, baseUrl } from "../Globals";
import { ProfileData, UserData } from "../Types";


export default function ChatRooms() {
    const navigate = useNavigate();

    const initialChatRooms = new ChatRoom(UserData.empty(), ProfileData.empty(), 0, "");

    const [chatRooms, setChatRooms] = useState([initialChatRooms]);

    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/chatRooms`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setChatRooms(json);
            })
            .catch((err: Error) => {
                console.log(`error when fetching chatrooms: ${err}`);
            })
    }, []);

    return (
        <div>
            <div className="container container-xxl" style={{ margin: "0 auto" }}>
                <Row>
                    <div className="col-4">
                        {
                            chatRooms.map((chatRoom) => (
                                <div key={chatRoom.user.id + "_" + chatRoom.profile.id} className="row" style={{ cursor: "pointer" }} onClick={() => { navigate(`/chat/${chatRoom.user.id}/${chatRoom.profile.id}`) }}>
                                    <Card>
                                        <Card.Body>
                                            <Row className="justify-content-center align-items-center">
                                                {chatRoom.user.id === -1
                                                    ? <div>
                                                        <Spinner animation="border" variant="success"></Spinner>
                                                    </div>
                                                    : <div>
                                                        <div className="col">
                                                            <img src={chatRoom.profile.profilePictures?.at(0)?.picture || ""} width="70px" height="70px" className="rounded-circle float-start" />
                                                        </div>
                                                        <div className="col text-center d-flex flex-column">
                                                            <h3>{`${chatRoom.user.name} / ${chatRoom.profile.name}`}</h3>
                                                        </div>
                                                    </div>
                                                }
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </div>
                            ))
                        }
                    </div>
                    <div className="col-1"></div>
                    <Col></Col>
                </Row>
            </div>
        </div>
    )
}

class ChatRoom {
    constructor(public user: UserData, public profile: ProfileData, public messageCount: number, public lastMessageOn: string) { }
}