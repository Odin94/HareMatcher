import "react-chat-elements/dist/main.css";
import 'simplebar/dist/simplebar.min.css';

import { createRef, useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useFocus, useInput } from "../CustomHooks";
import { apiVersion, baseUrl } from "../Globals";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";
import { UserData } from "../Types";
import { MessageBox } from "react-chat-elements";
import SimpleBar from 'simplebar-react';

export default function Chat() {
    const { userId, profileId } = useParams();

    const [chatPartner, setChatPartner] = useState(UserData.empty());
    const [chatPartnerFetchError, setChatPartnerFetchError] = useState("");
    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/users/${userId}`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setChatPartner(UserData.fromJson(json));
            })
            .catch((err: Error) => {
                console.log(`error when fetching chat partner: ${err}`);
                setChatPartnerFetchError(err.message);
            })
    }, []);

    const [me, setMe] = useState(UserData.empty());
    const [meFetchError, setMeFetchError] = useState("");
    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/users/me`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setMe(UserData.fromJson(json));
            })
            .catch((err: Error) => {
                console.log(`error when fetching me: ${err}`);
                setMeFetchError(err.message);
            })
    }, []);

    const [chatMessageHistory, setChatMessageHistory] = useState<ChatMessage[]>([]);
    const [historyFetchError, setHistoryFetchError] = useState("");
    useEffect(() => {
        fetch(`http://${baseUrl}/api/${apiVersion}/chatHistory/${userId}/${profileId}`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setChatMessageHistory(json);
            })
            .catch((err: Error) => {
                console.log(`error when fetching me: ${err}`);
                setHistoryFetchError(err.message);
            })
    }, []);

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
                const message = ChatMessage.fromIncoming(lastMessage, me.id);
                console.log(JSON.stringify(message))
                setChatMessageHistory((prev) => prev.concat(message));
            } else {
                console.log(`invalid message type in message: ${lastMessageEvent.data}`);
            }
        }
    }, [lastMessageEvent, setChatMessageHistory]);

    const handleClickSendMessage = useCallback(() => {
        if (rawChatMessage === "" || !profileId) return;
        const chatMessage = new ChatMessage(rawChatMessage, me.id, chatPartner.id, "", parseInt(profileId), uuidv4());
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
        scrollDownDummy.current?.scrollIntoView({ behavior: "smooth", inline: "end", block: "end" });
    }, [chatMessageHistory]);

    return (
        <div>
            <div className="container container-xxl">
                <h3>{chatPartner.name}</h3>

                <Card>
                    <Card.Body>
                        <SimpleBar style={{ maxHeight: "80vh" }}>
                            {chatMessageHistory.map((msg) => {
                                return (
                                    <MessageBox
                                        position={msg.sourceUserId === chatPartner.id ? "left" : "right"}
                                        type="text"
                                        title={msg.sourceUserId === chatPartner.id ? chatPartner.name : "You"}
                                        text={msg.message}
                                        dateString={msg.sentOn}
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