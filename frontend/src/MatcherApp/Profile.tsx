import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../GlobalConfig";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightHanging, faPalette } from '@fortawesome/free-solid-svg-icons'
import '../index.css';



const defaultEmptyPictureSource = "https://images.unsplash.com/photo-1610559176044-d2695ca6c63d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80";
const secondPictureSource = "https://images.unsplash.com/photo-1654077013798-8465c12f9672?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80";

export default function Profile() {
    const [profileData, setProfileData] = useState(new ProfileData("", "", "", "", 0, 0, "", undefined));
    const [userData, setUserData] = useState(new UserData("", "", []));
    const [lightBoxStatus, setLightBoxStatus] = useState(new LightBoxStatus(false, 0));
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/profile`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setProfileData(ProfileData.fromJson(json));
            })
            .catch((err: Error) => {
                console.log(`error when fetching: ${err}`);
                setFetchError(err.message);
            })
    }, []);

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/profile`, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(json => {
                console.log(json);
                setUserData(new UserData(json.name, json.email, json.profileIds));
            })
            .catch((err: Error) => {
                console.log(`error when fetching: ${err}`);
                setFetchError(err.message);
            })
    }, []);

    const imageSrc = profileData.pictureBlob ? URL.createObjectURL(profileData.pictureBlob) : defaultEmptyPictureSource;
    const profilePictures = [
        new ProfilePicture(imageSrc, 0),
        new ProfilePicture(secondPictureSource, 1),
        new ProfilePicture(imageSrc, 2),
        new ProfilePicture(secondPictureSource, 3),
    ];
    return (
        <div>
            {fetchError
                ? <h1>{fetchError}</h1>
                : <div className="container" style={{ width: "50%", margin: "0 auto" }}>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <h1>{profileData.name}</h1>
                                    <p>{profileData.race} • {profileData.age} • {profileData.city}</p>

                                    <Carousel
                                        swipeable={true}
                                        draggable={true}
                                        showDots={false}
                                        responsive={responsive}
                                        infinite={false}
                                        autoPlay={false}
                                        shouldResetAutoplay={false}
                                        keyBoardControl={true}
                                        containerClass="carousel-container"
                                        itemClass="carousel-item-padding-40-px"
                                    >
                                        {profilePictures.map((profilePicture) => (
                                            <img src={profilePicture.imageSource} onClick={() => setLightBoxStatus(new LightBoxStatus(true, profilePicture.index))} alt="" width="100%" height="100%" style={{ padding: "5px", cursor: "pointer" }}></img>
                                        ))}
                                    </Carousel>
                                    <p>This user has not set up their profile properly yet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{marginTop: "20px"}}>
                        <div className="col">
                            <div className="card">
                                <h5 className="card-header">Description</h5>
                                <div className="card-body">
                                  <p style={{fontSize: "1.23rem"}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eget pharetra augue. Fusce lectus lorem, suscipit vitae consequat blandit, dignissim ac metus. Fusce sodales, orci quis varius sollicitudin, orci metus aliquet urna, sit amet varius nunc nibh non augue. Donec porta consequat urna malesuada iaculis. Nulla sit amet sem congue felis sagittis imperdiet nec et dui. In cursus, dolor venenatis bibendum hendrerit, turpis ante porta massa, et tempus nisl quam in nibh</p>

                                   <p style={{fontSize: "1.23rem"}}>Proin convallis dui ut pharetra venenatis. Vivamus id faucibus sem. Nunc blandit pellentesque facilisis. Etiam egestas et mauris eget convallis. Aliquam laoreet egestas neque, eget ornare odio faucibus et. Donec placerat eros neque, sit amet egestas mi auctor a. Nulla gravida velit enim, vitae sodales odio egestas </p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card">
                                <h5 className="card-header">Details</h5>
                                <div className="card-body">
                                    <p><FontAwesomeIcon icon={faWeightHanging} style={{marginRight: "20px"}}/>{profileData.weightInKG} kg</p>
                                    <p><FontAwesomeIcon icon={faPalette} style={{marginRight: "20px"}}/>{profileData.furColor}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ul>{userData.profileIds?.map((profileId) => <li>{profileId}</li>)}</ul>
                </div>
            }
            {lightBoxStatus.isOpen && (
                <Lightbox
                    mainSrc={profilePictures[lightBoxStatus.index].imageSource}
                    nextSrc={lightBoxStatus.index === profilePictures.length - 1 ? undefined : profilePictures[lightBoxStatus.index + 1].imageSource}
                    prevSrc={lightBoxStatus.index === 0 ? undefined : profilePictures[(lightBoxStatus.index - 1)].imageSource}
                    onCloseRequest={() => setLightBoxStatus(new LightBoxStatus(false, 0))}
                    onMovePrevRequest={() =>
                        setLightBoxStatus(new LightBoxStatus(true, (lightBoxStatus.index + profilePictures.length - 1) % profilePictures.length))
                    }
                    onMoveNextRequest={() =>
                        setLightBoxStatus(new LightBoxStatus(true, (lightBoxStatus.index + 1) % profilePictures.length))
                    }
                />
            )}
        </div>
    )
}

class UserData {
    constructor(public name: string, public email: string, public profileIds: number[]) { }
}

class ProfileData {
    constructor(public name: string, public city: string, public race: string, public furColor: string,
        public age: number, public weightInKG: number, public description: string, public pictureBlob?: Blob) { }

    static fromJson(json: any): ProfileData {
        return new ProfileData(json.name, json.city, json.race, json.furColor, json.age, json.weightInKG, json.description, json.picture);
    }
}

class LightBoxStatus {
    constructor(public isOpen: boolean, public index: number) { }
}

class ProfilePicture {
    constructor(public imageSource: string, public index: number) { }
}

const responsive = {
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
};

