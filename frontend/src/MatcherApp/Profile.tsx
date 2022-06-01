import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../GlobalConfig";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const defaultEmptyPictureSource = "https://images.unsplash.com/photo-1610559176044-d2695ca6c63d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2569&q=80"

export default function Profile() {
    const [profileData, setProfileData] = useState(new ProfileData("", "", "", "", 0, 0, "", undefined));
    const [userData, setUserData] = useState(new UserData("", "", []));
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/profile`, {  // TODO: Move this to an actual profile page; turn this page into profile-selection-page
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
    }, [])

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
    }, [])

    const profiles = userData.profileIds?.map((profileId) => <li>{profileId}</li>);  // TODO: Turn into link to actual profile page
    const imageSrc = profileData.pictureBlob ? URL.createObjectURL(profileData.pictureBlob) : defaultEmptyPictureSource
    return (
        <div>
            {fetchError
                ? <h1>{fetchError}</h1>
                : <div style={{width: "50%", margin: "0 auto"}}>
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
                        <img src={imageSrc} alt="" width="100%" height="100%" style={{padding: "5px"}}></img>
                        <img src={imageSrc} alt="" width="100%" height="100%" style={{padding: "5px"}}></img>
                        <img src={imageSrc} alt="" width="100%" height="100%" style={{padding: "5px"}}></img>
                        <img src={imageSrc} alt="" width="100%" height="100%" style={{padding: "5px"}}></img>
                    </Carousel>
                    <h1>{profileData.name}</h1>
                    <p>This user has not set up their profile properly yet</p>

                    <ul>{profiles}</ul>
                </div>
            }
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

