import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useFocus, useInput } from "../CustomHooks";
import { apiVersion, baseUrl } from "../Globals";


export default function Chat() {
    const [messageHistory, setMessageHistory] = useState<MessageEvent[]>([]);
    const { value: chatMessage, bind: bindChatMessage, reset: resetChatMessage } = useInput("");
    const [inputRef, setInputFocus] = useFocus();

    const { sendMessage, lastMessage, readyState } = useWebSocket(`ws://${baseUrl}/api/${apiVersion}/chat`, {
        shouldReconnect: (_closeEvent) => true,
    });

    useEffect(() => {
        console.log(chatMessage)
        if (lastMessage !== null) {
            setMessageHistory((prev) => prev.concat(lastMessage));
        }
    }, [lastMessage, setMessageHistory]);

    // const handleClickSendMessage = useCallback(() => sendMessage(chatMessage), [chatMessage]);
    const handleClickSendMessage = useCallback(() => {
        sendMessage(chatMessage);
        resetChatMessage();
    }, [chatMessage]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const createChatCard = (chatMessage: string) => (
        <Card>
            <Card.Body>
                <p>{chatMessage}</p>
            </Card.Body>
        </Card>
    );

    return (
        <div>
            <div className="container container-xxl">
                {messageHistory.map((message, idx) => (
                    <Row key={idx}>
                        <Col>{createChatCard(message.data)}</Col>
                        <Col></Col>
                    </Row>
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
            {lastMessage ? <p>Last message: {lastMessage.data}</p> : null}
        </div>
    );
}