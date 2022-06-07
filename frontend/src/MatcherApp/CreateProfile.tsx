import { FormEvent, useState } from "react";
import { apiVersion, baseUrl, hashCode } from "../Globals";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightHanging, faPalette, faSyringe } from '@fortawesome/free-solid-svg-icons'
import '../index.css';
import { useInput } from "../CustomHooks";
import { Button, Form } from "react-bootstrap";


const defaultEmptyPictureSource = "https://images.unsplash.com/photo-1610559176044-d2695ca6c63d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80";


export default function CreateProfile() {
    const { value: name, bind: bindName, reset: resetName } = useInput('');
    const { value: race, bind: bindRace, reset: resetRace } = useInput('');
    const { value: age, bind: bindAge, reset: resetAge } = useInput('');
    const { value: city, bind: bindCity, reset: resetCity } = useInput('');
    const { value: furColor, bind: bindFurColor, reset: resetFurColor } = useInput('');
    const { value: weightInKg, bind: bindWeightInKg, reset: resetWeightInKg } = useInput('');
    const { value: description, bind: bindDescription, reset: resetDescription } = useInput('');

    const [postError, setPostError] = useState("");


    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        fetch(`${baseUrl}/api/${apiVersion}/profiles`, {
            method: "POST",
            body: JSON.stringify({ name, race, age, city, description, furColor, weightInKg }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(json => alert(JSON.stringify(json)))
            .catch((err: Error) => {
                console.log(`error when posting: ${err}`);
                setPostError(err.message);
            })
    }

    return (
        <div>
            {postError
                ? <h1>{postError}</h1>
                : <div className="container" style={{ width: "50%", margin: "0 auto" }}>
                    <div className="row">
                        <div className="col">
                            <h1>Create new Profile</h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <h3>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Name
                                                <input className="form-control" type="text" {...bindName} />
                                            </label>
                                        </div>
                                    </h3>
                                    <h3>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Race
                                                <input className="form-control" type="text" {...bindRace} />
                                            </label>
                                        </div>
                                    </h3>
                                    <h3>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Age
                                                <input className="form-control" type="text" {...bindAge} />
                                            </label>
                                        </div>
                                    </h3>
                                    <h3>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                City
                                                <input className="form-control" type="text" {...bindCity} />
                                            </label>
                                        </div>
                                    </h3>
                                    <h3>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                FurColor
                                                <input className="form-control" type="text" {...bindFurColor} />
                                            </label>
                                        </div>
                                    </h3>
                                    <h3>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                WeightInKg
                                                <input className="form-control" type="text" {...bindWeightInKg} />
                                            </label>
                                        </div>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row" style={{ marginTop: "20px" }}>
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
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
                                        <img src={defaultEmptyPictureSource} alt="" width="100%" height="100%" style={{ padding: "5px", cursor: "pointer", objectFit: "cover" }}></img>
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
                                    <div className="form-group">
                                        <textarea className="form-control" rows={8} {...bindDescription} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card">
                                <h5 className="card-header">Details</h5>
                                <div className="card-body">
                                    <p><FontAwesomeIcon icon={faWeightHanging} style={{ marginRight: "20px" }} /> kg</p>
                                    <p><FontAwesomeIcon icon={faPalette} style={{ marginRight: "20px" }} /></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row" style={{ marginTop: "20px", marginBottom: "40px", float: "right" }}>
                        <div className="col">
                            <Form onSubmit={handleSubmit}>
                                <Button variant="primary" type="submit">Submit</Button>
                            </Form>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
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
};
