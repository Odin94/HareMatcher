import "react-chat-elements/dist/main.css";
import 'simplebar/dist/simplebar.min.css';

import { createRef, useCallback, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useFocus, useInput } from "../CustomHooks";
import { apiVersion, baseUrl } from "../Globals";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";
import { MessageBox } from "react-chat-elements";
import SimpleBar from 'simplebar-react';
import moment from "moment";
import { useUser } from "../api";
import { useQuery } from "react-query";

export default function Chat() {
    const { userId, profileId } = useParams();
    const chatPartnerQuery = useUser(userId!);

    const meQuery = useUser("me");
    const [chatMessageHistory, setChatMessageHistory] = useState<ChatMessage[]>([]);

    const { isLoading, error } = useQuery("profile", () => fetchChatHistory(userId!, profileId!));
    const fetchChatHistory = (userId: number | string, profileId: number | string) => {
        return fetch(`http://${baseUrl}/api/${apiVersion}/chatHistory/${userId}/${profileId}`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => json.map((msgJson: any) => ChatMessage.fromIncoming(msgJson, parseInt(`${userId}`))))
            .then(chatMessages => {
                setChatMessageHistory(chatMessages);
                return chatMessages
            })
    }

    const { value: rawChatMessage, bind: bindChatMessage, reset: resetChatMessage } = useInput("");
    const [inputRef, setInputFocus] = useFocus();

    const { sendMessage, lastMessage: lastMessageEvent, readyState } = useWebSocket(`ws://${baseUrl}/api/${apiVersion}/chat`, {
        shouldReconnect: (_closeEvent) => true,
    });

    useEffect(() => {
        if (lastMessageEvent !== null) {
            const lastMessage = JSON.parse(lastMessageEvent.data);

            if (lastMessage.errorMessage !== undefined) {
                const errorMessage = lastMessage as ChatError;
                const relatedMessage = chatMessageHistory.find(msg => msg.uuid === errorMessage.messageUuid);
                console.log(`Error: ${JSON.stringify(errorMessage)} \n\n for message: ${JSON.stringify(relatedMessage)}`);
            }

            else if (lastMessage.message !== null) {
                const message = ChatMessage.fromIncoming(lastMessage, meQuery.user!.id);
                console.log(JSON.stringify(message))
                setChatMessageHistory((prev) => prev.concat(message));
            } else {
                console.log(`invalid message type in message: ${lastMessageEvent.data}`);
            }
        }
    }, [lastMessageEvent, setChatMessageHistory]);

    const handleClickSendMessage = useCallback(() => {
        if (rawChatMessage === "" || !profileId) return;
        const chatMessage = new ChatMessage(rawChatMessage, meQuery.user!.id, chatPartnerQuery.user!.id, "", parseInt(profileId), uuidv4());
        sendMessage(JSON.stringify(chatMessage));
        setChatMessageHistory((prev) => prev.concat(chatMessage));
        resetChatMessage();
    }, [rawChatMessage]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const scrollDownDummy = createRef<HTMLDivElement>();

    useEffect(() => {
        scrollDownDummy.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessageHistory]);

    if (isLoading) {
        return (<Spinner animation="border" variant="success"></Spinner>);
    }

    if (error) {
        return (<h1>{`Error: ${error}`}</h1>);
    }

    return (
        <div>
            <div className="container container-xxl">
                <div style={{ paddingBottom: "20px" }}>
                    <img src={chatPartnerQuery.user?.picture} width="70px" height="70px" className="rounded-circle" />
                    <h1 style={{ display: "inline-block", marginLeft: "20px", position: "relative", top: "15px", fontSize: "50px" }}>{chatPartnerQuery.user?.name ?? ""}</h1>
                </div>

                <Card>
                    <Card.Body>
                        <SimpleBar style={{ maxHeight: "75vh" }}>
                            {(isLoading || chatPartnerQuery.isUserLoading)
                                ? <Spinner animation="border" variant="success"></Spinner>
                                : chatMessageHistory.map((msg) => {
                                    return (
                                        <MessageBox
                                            position={msg.sourceUserId === chatPartnerQuery.user!.id ? "left" : "right"}
                                            type="text"
                                            title={msg.sourceUserId === chatPartnerQuery.user!.id ? chatPartnerQuery.user!.name : "You"}
                                            text={msg.message}
                                            date={moment(msg.sentOn, "DD.MM.yyyy HH:mm").toDate()}
                                        />
                                    )
                                })}

                            <div ref={scrollDownDummy}></div>
                        </SimpleBar>
                    </Card.Body>
                </Card>
                <Row className="fixed-bottom">
                    <Card>
                        <Card.Body>
                            <Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                e.preventDefault();
                                handleClickSendMessage();
                                setInputFocus();
                            }} >
                                <InputGroup className="mb-3">
                                    <Form.Control autoFocus ref={inputRef} {...bindChatMessage} placeholder="Write a message..." />
                                    <Button variant="outline-primary" size="lg" type="submit">Send</Button>
                                </InputGroup>
                            </Form>
                        </Card.Body>
                    </Card>
                </Row>
            </div>

            <p>The WebSocket is currently {connectionStatus}</p>
            {lastMessageEvent ? <p>Last message: {lastMessageEvent.data}</p> : null}
        </div >
    );
}

class ChatMessage {
    constructor(public message: string, public sourceUserId: number, public targetUserId: number, public sentOn: string, public profileInQuestionId: number, public uuid?: string) { }

    static fromIncoming(json: any, myUserId: number): ChatMessage {
        return new ChatMessage(json.message, json.sourceUserId, myUserId, json.sentOn, json.profileInQuestionId, json.uuid);
    }
};

type ChatErrorCause = "TargetUserNotFound";

class ChatError {
    constructor(public errorMessage: string, public messageUuid: string, public cause: ChatErrorCause) { }
}