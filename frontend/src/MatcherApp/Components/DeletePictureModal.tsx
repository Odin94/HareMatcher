import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export interface DeletePictureModalProps {
    onDeleteCallback: () => void,
    onCloseCallback: () => void,
    show: boolean
}

const DeletePictureModal: React.FC<DeletePictureModalProps> = ({ onDeleteCallback, onCloseCallback, show }: DeletePictureModalProps) => {
    return (
        <>
            <Modal
                show={show}
                keyboard={false}
                onHide={onCloseCallback}
                onExit={onCloseCallback}
            >
                <Modal.Header className="heading">
                    <Modal.Title>Delete Picture?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button style={{ marginRight: "auto" }} variant="danger" onClick={() => { onDeleteCallback(); onCloseCallback() }}>
                        Delete Picture
                    </Button>
                    <Button onClick={onCloseCallback}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default DeletePictureModal