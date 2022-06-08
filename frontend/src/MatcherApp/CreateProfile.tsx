import { FormEvent, useState } from "react";
import { apiVersion, baseUrl, convertBase64, hashCode } from "../Globals";
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
    const { value: age, bind: bindAge, reset: resetAge } = useInput('0');
    const { value: city, bind: bindCity, reset: resetCity } = useInput('');
    const { value: furColor, bind: bindFurColor, reset: resetFurColor } = useInput('brown');
    const { value: weightInKg, bind: bindWeightInKg, reset: resetWeightInKg } = useInput('0.0');
    const { value: description, bind: bindDescription, reset: resetDescription } = useInput('');
    const [pictureSources, setPictureSources] = useState([] as File[]);

    const [postError, setPostError] = useState("");


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const imagesBase64 = await Promise.all(pictureSources.map(async (file) => await convertBase64(file)));

        fetch(`${baseUrl}/api/${apiVersion}/profiles`, {
            method: "POST",
            body: JSON.stringify({ name, race, age, city, description, furColor, weightInKg, imagesBase64 }),
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
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>Name</h3></label>
                                        <div className="col-sm-10" style={{maxWidth: "400px"}}>
                                        <input className="form-control" {...bindName}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>Race</h3></label>
                                        <div className="col-sm-10" style={{maxWidth: "400px"}}>
                                        <input className="form-control" {...bindRace}/>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>Age</h3></label>
                                        <div className="col-sm-10" style={{maxWidth: "400px"}}>
                                        <select className="custom-select" {...bindAge}>
                                            <option selected>0</option>
                                            {Array.from(Array(19).keys()).map((num: number) => (
                                                <option value={num + 1}>{num + 1}</option>
                                            ))}
                                        </select>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>City</h3></label>
                                        <div className="col-sm-10" style={{maxWidth: "400px"}}>
                                        <input className="form-control" {...bindCity}/>
                                        </div>
                                    </div>
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
                                        <img src={pictureSources[0] ? URL.createObjectURL(pictureSources[0]) : defaultEmptyPictureSource} alt="" width="100%" height="100%" style={{ padding: "5px", cursor: "pointer", objectFit: "cover" }}></img>
                                    </Carousel>

                                    <div className="form-group row" style={{marginTop: "20px"}}>
                                        <div className="col-sm-10" style={{maxWidth: "400px"}}>
                                            <Form.Group controlId="formFile" className="mb-3">
                                                <Form.Control type="file" onChange={async (event: any) => {
                                                        const newPictureSources = [...pictureSources];
                                                        newPictureSources[0] = event.target.files[0];
                                                        setPictureSources(newPictureSources);

                                                        const file = event.target.files[0];
                                                        const base64 = await convertBase64(file);

                                                        console.log(URL.createObjectURL(event.target.files[0]))
                                                    }}/>
                                            </Form.Group>
                                        </div>
                                    </div>
                                    
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
                                    <p><FontAwesomeIcon icon={faWeightHanging} style={{ marginRight: "20px" }} /><input style={{width: "70px", display: "inline-block"}} className="form-control" type="text" {...bindWeightInKg} /> kg</p>
                                    <p><FontAwesomeIcon icon={faPalette} style={{ marginRight: "20px" }} /><input style={{width: "140px", display: "inline-block"}} className="form-control" type="text" {...bindFurColor} /></p>
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
