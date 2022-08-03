import "react-chat-elements/dist/main.css";
import 'simplebar/dist/simplebar.min.css';

import { Row, Spinner } from "react-bootstrap";
import { ChatList } from "react-chat-elements";
import { useNavigate } from "react-router-dom";
import { useChatRooms as useChatRooms } from "../api";


export default function ChatRooms() {
    const navigate = useNavigate();

    const { isChatRoomsLoading, chatRoomsError, chatRooms } = useChatRooms();

    if (isChatRoomsLoading) {
        return (<Spinner animation="border" variant="success"></Spinner>);
    }

    if (chatRoomsError) {
        return (<h1>{`Error: ${chatRoomsError}`}</h1>);
    }

    return (
        <div>
            <div className="container container-xxl" style={{ margin: "0 auto" }}>
                <Row>
                    <div className="col-4">
                        <ChatList
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
                    </div>
                </Row>
            </div>
        </div>
    )
}
