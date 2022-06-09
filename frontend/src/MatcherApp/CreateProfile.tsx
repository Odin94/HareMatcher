import { FormEvent, useState } from "react";
import { apiVersion, baseUrl } from "../Globals";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightHanging, faPalette, faSyringe, faPlus } from '@fortawesome/free-solid-svg-icons'
import '../index.css';
import { useInput } from "../CustomHooks";
import { Button, Form } from "react-bootstrap";
import { Vaccination } from "./Types";


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
    const [vaccinations, setVaccinations] = useState([new Vaccination("", "")] as Vaccination[]);

    const [postError, setPostError] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        
        const formData = new FormData();
        formData.append("name", name);
        formData.append("race", race);
        formData.append("age", age);
        formData.append("city", city);
        formData.append("description", description);
        formData.append("furColor", furColor);
        formData.append("weightInKg", weightInKg);
        for (const i in pictureSources) {
            formData.append(`image${i}`, pictureSources[i]);
        }
        formData.append("vaccinations", JSON.stringify(vaccinations));

        fetch(`${baseUrl}/api/${apiVersion}/profiles`, {
            method: "POST",
            body: formData,
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
                                            {Array.from(Array(20).keys()).map((num: number) => (
                                                <option key={num} value={num}>{num}</option>
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
                                        {pictureSources.length > 0 ? pictureSources.map((picture) => (
                                            <img src={URL.createObjectURL(picture)} alt="" width="100%" height="100%" style={{ padding: "5px", cursor: "pointer", objectFit: "cover" }}></img>
                                        )) : (
                                            <img src={defaultEmptyPictureSource} alt="" width="100%" height="100%" style={{ padding: "5px", cursor: "pointer", objectFit: "cover" }}></img>
                                        )}
                                    </Carousel>

                                    <div className="form-group row" style={{marginTop: "20px"}}>
                                        <div className="col-sm-10" style={{maxWidth: "400px"}}>
                                            <Form.Group controlId="formFile" className="mb-3">
                                                <Form.Control type="file" onChange={async (event: any) => {
                                                        const newPictureSources = [...pictureSources];
                                                        newPictureSources.push(event.target.files[0]);
                                                        setPictureSources(newPictureSources);
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
                                    {vaccinations.map((vac, i) => (
                                        <p key={i}><FontAwesomeIcon icon={faSyringe} style={{marginRight: "20px"}}/>
                                            <input style={{width: "280px", display: "inline-block"}} className="form-control" type="text" value={vac.disease} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { 
                                                const newVaccinations = [...vaccinations];
                                                newVaccinations[i].disease = (event.currentTarget.value);
                                                setVaccinations(newVaccinations);
                                             }} />
                                            <span style={{float: "right"}}>
                                                <input style={{width: "140px", display: "inline-block"}} className="form-control" type="date" value={vac.date} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { 
                                                    const newVaccinations = [...vaccinations];
                                                    newVaccinations[i].date = (event.currentTarget.value);
                                                    setVaccinations(newVaccinations);
                                                 }} />
                                             </span>
                                         </p>
                                    ))}
                                    <p style={{ marginTop: "30px", fontSize: "40px" }}><button onClick={() => {
                                        const newVaccinations = [...vaccinations];
                                        newVaccinations.push(new Vaccination("", ""));
                                        setVaccinations(newVaccinations);
                                    }} type="button" className="btn btn-outline-success"><FontAwesomeIcon icon={faPlus}/> Add Vaccination</button></p>
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
