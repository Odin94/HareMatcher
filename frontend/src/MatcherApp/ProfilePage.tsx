import { faPalette, faSyringe, faWeightHanging, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useNavigate } from 'react-router-dom';
import { useProfile } from "../api";
import { apiVersion, baseUrl, hashCode } from "../Globals";
import '../index.css';
import { ProfilePicture, profilePictureSchema } from "../Types";
import MatchButton from "./MatchButton";


const defaultEmptyPictureSource = "https://images.unsplash.com/photo-1610559176044-d2695ca6c63d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80"

const ProfilePage: React.FC<ProfileProps> = ({ profileId, onSwipeComplete = () => { } }: ProfileProps) => {
    const navigate = useNavigate()
    const [lightBoxStatus, setLightBoxStatus] = useState(new LightBoxStatus(false, 0))
    const { isProfileLoading, profileError, profile } = useProfile(profileId)

    const swipe = (likeOrPass: "LIKE" | "PASS") => {
        fetch(`http://${baseUrl}/api/${apiVersion}/swipe`, {
            method: "POST",
            body: JSON.stringify({ profileId: profileId, likeOrPass: likeOrPass }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText)
                return response.status
            })
            .then(status => console.log(`post successful: ${status}`))
            .catch((err: Error) => {
                console.log(`error when posting: ${err}`)
            })
    }

    const profilePictures: ProfilePicture[] = profile?.profilePictures || [profilePictureSchema.validateSync({ picture: defaultEmptyPictureSource, index: 0 })]

    if (isProfileLoading) {
        return (<Spinner animation="border" variant="success"></Spinner>)
    }

    if (profileError) {
        return (<h1>{`Error: ${profileError}`}</h1>)
    }


    if (!profile) {
        throw new Error("where profile?")
    }
    return (
        <div>
            <div className="container container-xxl" style={{ margin: "0 auto" }}>
                <div className="row">
                    <div className="col">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col">
                                        <h1>{profile.name}</h1>
                                        <p>{profile.race} • {profile.age} • {profile.city}</p>
                                    </div>
                                    <div className="col">
                                        {profile.matchable
                                            ? <div>
                                                <MatchButton swipe={() => swipe("LIKE")} onSwipeComplete={onSwipeComplete} />
                                                <button onClick={() => { swipe("PASS"); setTimeout(onSwipeComplete, 500) }} className="btn btn-outline-secondary btn-lg rounded-pill" type="button" style={{ float: "right", margin: "10px", width: "160px" }}><FontAwesomeIcon icon={faX} style={{ marginRight: "10px" }} />Pass</button>
                                            </div>
                                            : <div><Button variant="light" onClick={() => { navigate(`/profiles/update/${profileId}`) }}>Edit Profile</Button></div>
                                        }
                                    </div>
                                </div>

                                <Carousel
                                    swipeable={true}
                                    draggable={true}
                                    showDots={false}
                                    responsive={carouselResponsive}
                                    infinite={false}
                                    autoPlay={false}
                                    shouldResetAutoplay={false}
                                    keyBoardControl={true}
                                    containerClass="carousel-container"
                                    itemClass="carousel-item-padding-40-px"
                                >
                                    {profilePictures.map((profilePicture) => (
                                        <img key={hashCode(profilePicture.picture)} src={profilePicture.picture} onClick={() => setLightBoxStatus(new LightBoxStatus(true, profilePicture.index))} alt={`Profile of ${profile.name}`} width="100%" height="100%" style={{ padding: "5px", cursor: "pointer", objectFit: "cover" }}></img>
                                    ))}
                                </Carousel>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row" style={{ marginTop: "20px" }}>
                    <div className="col">
                        <div className="card">
                            <h5 className="card-header">Description</h5>
                            <div className="card-body">
                                {profile.description.split("\n\n").map((paragraph) => (
                                    <p key={hashCode(paragraph)} style={{ fontSize: "1.23rem" }}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card">
                            <h5 className="card-header">Details</h5>
                            <div className="card-body">
                                <p><FontAwesomeIcon icon={faWeightHanging} style={{ marginRight: "20px" }} />{profile.weightInKG} kg</p>
                                <p><FontAwesomeIcon icon={faPalette} style={{ marginRight: "20px" }} />{profile.furColor}</p>
                                {profile.vaccinations?.map((vac) => (
                                    <p key={vac.disease}><FontAwesomeIcon icon={faSyringe} style={{ marginRight: "20px" }} />{vac.disease} <span style={{ float: "right" }}>{vac.date}</span></p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {lightBoxStatus.isOpen && (
                <Lightbox
                    mainSrc={profilePictures[lightBoxStatus.index].picture}
                    nextSrc={lightBoxStatus.index === profilePictures.length - 1 ? undefined : profilePictures[lightBoxStatus.index + 1].picture}
                    prevSrc={lightBoxStatus.index === 0 ? undefined : profilePictures[(lightBoxStatus.index - 1)].picture}
                    onCloseRequest={() => setLightBoxStatus(new LightBoxStatus(false, 0))}
                    onMovePrevRequest={() =>
                        setLightBoxStatus(new LightBoxStatus(true, (lightBoxStatus.index + profilePictures.length - 1) % profilePictures.length))
                    }
                    onMoveNextRequest={() =>
                        setLightBoxStatus(new LightBoxStatus(true, (lightBoxStatus.index + 1) % profilePictures.length))
                    }
                    onImageLoad={() => { window.dispatchEvent(new Event('resize')) }}
                />
            )}
        </div>
    )
}

class LightBoxStatus {
    constructor(public isOpen: boolean, public index: number) { }
}

const carouselResponsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 3,
        slidesToSlide: 1
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
        slidesToSlide: 1
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1
    }
}

export interface ProfileProps {
    profileId: number,
    onSwipeComplete?: () => void,
}

export default ProfilePage