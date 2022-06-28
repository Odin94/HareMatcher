import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useFocus, useInput } from "../CustomHooks";
import { apiVersion, baseUrl } from "../Globals";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";
import { UserData } from "../Types";

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
        if (rawChatMessage === "") return;
        const chatMessage = new ChatMessage(rawChatMessage, me.id, chatPartner.id, uuidv4());
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

    const createChatCard = (chatMessage: ChatMessage, idx: number) => (
        <Row key={idx}>
            <Col>
                {chatMessage.targetUserId == chatPartner.id &&
                    <Card>
                        <Card.Body>
                            <p>{`You: ${chatMessage.message}`}</p>
                        </Card.Body>
                    </Card>
                }

            </Col>
            <Col>
                {chatMessage.targetUserId == me.id &&
                    <Card>
                        <Card.Body>
                            <p>{`${chatPartner.name}: ${chatMessage.message}`}</p>
                        </Card.Body>
                    </Card>
                }
            </Col>
        </Row>
    );

    return (
        <div>
            <div className="container container-xxl">
                <h3>{chatPartner.name}</h3>
                {chatMessageHistory.map((chatMessage, idx) => (
                    createChatCard(chatMessage, idx)
                ))}
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
        </div>
    );
}

class ChatMessage {
    constructor(public message: string, public sourceUserId: number, public targetUserId: number, public sentOn: string, public uuid?: string) { }

    static fromIncoming(json: any, myUserId: number): ChatMessage {
        return new ChatMessage(json.message, json.sourceUserId, myUserId, json.sentOn, json.uuid);
    }
};

type ChatErrorCause = "TargetUserNotFound";

class ChatError {
    constructor(public errorMessage: string, public messageUuid: string, public cause: ChatErrorCause) { }
}