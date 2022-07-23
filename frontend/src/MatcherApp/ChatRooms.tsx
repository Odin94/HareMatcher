import "react-chat-elements/dist/main.css";
import 'simplebar/dist/simplebar.min.css';

import { useEffect, useState } from "react";
import { Row, Spinner } from "react-bootstrap";
import { ChatList } from "react-chat-elements";
import { useNavigate } from "react-router-dom";
import { apiVersion, baseUrl } from "../Globals";
import { ProfileData, UserData } from "../Types";


export default function ChatRooms() {
    const navigate = useNavigate();

    const initialChatRoom = new ChatRoom(UserData.empty(), ProfileData.empty(), 0, "");

    const [chatRooms, setChatRooms] = useState([initialChatRoom]);

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
                        {chatRooms[0]?.user.id === -1
                            ? <Spinner animation="border" variant="success"></Spinner>
                            : <ChatList
                                className='chat-list'
                                onClick={(chatElement: any) => { navigate(chatElement.chatLink) }}
                                dataSource={chatRooms.map((chatRoom) => {
                                    return {
                                        avatar: chatRoom.profile.profilePictures?.at(0)?.picture || "",
                                        title: `${chatRoom.user.name} / ${chatRoom.profile.name}`,
                                        subtitle: "todo: load latest message",
                                        date: new Date(),
                                        unread: -1,
                                        chatLink: `/chat/${chatRoom.user.id}/${chatRoom.profile.id}`
                                    }
                                })}
                            />
                        }

                    </div>
                </Row>
            </div>
        </div>
    )
}

class ChatRoom {
    constructor(public user: UserData, public profile: ProfileData, public messageCount: number, public lastMessageOn: string) { }
}