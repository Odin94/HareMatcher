import { FormEvent, useState } from "react";
import { apiVersion, baseUrl, range } from "../Globals";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightHanging, faPalette, faSyringe, faPlus } from '@fortawesome/free-solid-svg-icons'
import '../index.css';
import { useInput } from "../CustomHooks";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { profilePictureSchema, vaccinationSchema } from "../Types";
import { useParams } from "react-router-dom";
import { useProfile } from "../api";
import { useQueryClient } from "react-query";
import moment from "moment";
import DeletePictureModal from "./Components/DeletePictureModal";


const defaultEmptyPictureSource = "https://images.unsplash.com/photo-1610559176044-d2695ca6c63d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80"


export default function UpdateProfile() {
    const { id: profileId } = useParams()
    if (!profileId) {
        return (<h1>{`Error: Need id`}</h1>)
    }
    const { isProfileLoading, profileError, profile } = useProfile(parseInt(profileId))
    const queryClient = useQueryClient()

    if (isProfileLoading) {
        return (<Spinner animation="border" variant="success"></Spinner>)
    }
    if (profileError) {
        return (<h1>{`Error: ${profileError}`}</h1>)
    }

    const { value: name, bind: bindName } = useInput(profile?.name)
    const { value: race, bind: bindRace } = useInput(profile?.race)
    const { value: age, bind: bindAge } = useInput(profile?.age)
    const { value: city, bind: bindCity } = useInput(profile?.city)
    const { value: furColor, bind: bindFurColor } = useInput(profile?.furColor)
    const { value: weightInKG, bind: bindWeightInKg } = useInput(profile?.weightInKG)
    const { value: description, bind: bindDescription } = useInput(profile?.description)
    const [pictureSources, setPictureSources] = useState(profile?.profilePictures?.sort((a, b) => { return a.index - b.index }) ?? [])
    const [vaccinations, setVaccinations] = useState(profile?.vaccinations ?? [])

    const [deletePictureModalState, setDeletePictureModalState] = useState({ imageIndex: -1, show: false })

    console.log({ pictureSources })

    const [postError, setPostError] = useState("")

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        const formData = new FormData()
        formData.append("name", name)
        formData.append("race", race)
        formData.append("age", age)
        formData.append("city", city)
        formData.append("description", description)
        formData.append("furColor", furColor)
        formData.append("weightInKG", weightInKG)
        for (const i in pictureSources) {
            formData.append(`image${i}`, pictureSources[i].picture)
        }
        formData.append("vaccinations", JSON.stringify(vaccinations))

        fetch(`http://${baseUrl}/api/${apiVersion}/profiles/${profileId}`, {
            method: "PUT",
            body: formData,
            credentials: 'include',
        })
            .then(response => {
                console.log({ response })

                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
                return response.json()
            })
            .then(_json => queryClient.invalidateQueries('profile'))
            .catch((err: Error) => {
                console.log(`error when posting: ${err}`)
                setPostError(err.message)
            })
    }

    return (
        <div>
            {postError
                ? <h1>{postError}</h1>
                : <div className="container container-xxl" style={{ margin: "0 auto" }}>
                    <div className="row">
                        <div className="col">
                            <h1>Edit Profile</h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>Name</h3></label>
                                        <div className="col-sm-10" style={{ maxWidth: "400px" }}>
                                            <input className="form-control" {...bindName} />
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>Race</h3></label>
                                        <div className="col-sm-10" style={{ maxWidth: "400px" }}>
                                            <input className="form-control" {...bindRace} />
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>Age</h3></label>
                                        <div className="col-sm-10" style={{ maxWidth: "400px" }}>
                                            <select className="custom-select" {...bindAge}>
                                                {range(0, 20).map((num: number) => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <label className="col-sm-2 col-form-label"><h3>City</h3></label>
                                        <div className="col-sm-10" style={{ maxWidth: "400px" }}>
                                            <input className="form-control" {...bindCity} />
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
                                        {pictureSources.length > 0 ? pictureSources.map(source => source.picture).map((picture, i) => (
                                            <img key={i} src={picture} onClick={() => setDeletePictureModalState({ imageIndex: i, show: true })} alt="" width="100%" height="100%" style={{ padding: "5px", cursor: "pointer", objectFit: "cover" }}></img>
                                        )) : (
                                            <img src={defaultEmptyPictureSource} alt="" width="100%" height="100%" style={{ padding: "5px", cursor: "pointer", objectFit: "cover" }}></img>
                                        )}
                                    </Carousel>

                                    <div className="form-group row" style={{ marginTop: "20px" }}>
                                        <div className="col-sm-10" style={{ maxWidth: "400px" }}>
                                            <Form.Group controlId="formFile" className="mb-3">
                                                <Form.Control type="file" onChange={async (event: any) => {
                                                    const newPictureSources = [...pictureSources]
                                                    const newPicture = profilePictureSchema.validateSync({
                                                        picture: URL.createObjectURL(event.target.files[0]),
                                                        index: newPictureSources.length
                                                    })
                                                    newPictureSources.push(newPicture)
                                                    setPictureSources(newPictureSources)
                                                }} />
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
                                    <p><FontAwesomeIcon icon={faWeightHanging} style={{ marginRight: "20px" }} /><input style={{ width: "70px", display: "inline-block" }} className="form-control" type="text" {...bindWeightInKg} /> kg</p>
                                    <p><FontAwesomeIcon icon={faPalette} style={{ marginRight: "20px" }} /><input style={{ width: "140px", display: "inline-block" }} className="form-control" type="text" {...bindFurColor} /></p>
                                    {vaccinations.map((vac, i) => (
                                        <Row key={i} style={{ marginBottom: "12px" }}>
                                            <Col xs={8}>
                                                <span>
                                                    <FontAwesomeIcon icon={faSyringe} style={{ marginRight: "20px" }} />
                                                    <input style={{ width: "280px", display: "inline-block" }} className="form-control" type="text" value={vac.disease} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                        const newVaccinations = [...vaccinations]
                                                        newVaccinations[i].disease = (event.currentTarget.value)
                                                        setVaccinations(newVaccinations)
                                                    }} />
                                                </span>
                                            </Col>
                                            <Col xs={3}><input style={{ width: "140px", display: "inline-block" }} className="form-control" type="date" value={moment(vac.date, "DD.MM.yyyy").format("yyyy-MM-DD")} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                const newVaccinations = [...vaccinations]
                                                newVaccinations[i].date = moment(event.currentTarget.value, "yyyy-MM-DD").format("DD.MM.yyyy")
                                                setVaccinations(newVaccinations)
                                            }} />
                                            </Col>
                                            <Col size="sm" xs={1}><Button onClick={() => {
                                                const newVaccinations = [...vaccinations]
                                                newVaccinations.splice(i, 1)
                                                setVaccinations(newVaccinations)
                                            }} variant="danger">X</Button>
                                            </Col>
                                        </Row>
                                    ))}
                                    <p style={{ marginTop: "30px", fontSize: "40px" }}><button onClick={() => {
                                        const newVaccinations = [...vaccinations]
                                        newVaccinations.push(vaccinationSchema.validateSync({ disease: "_", date: "01.01.2022" }))
                                        setVaccinations(newVaccinations)
                                    }} type="button" className="btn btn-outline-success"><FontAwesomeIcon icon={faPlus} /> Add Vaccination</button></p>
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
            <DeletePictureModal
                onDeleteCallback={() => { pictureSources.splice(deletePictureModalState.imageIndex, 1); setPictureSources(pictureSources) }}
                onCloseCallback={() => { setDeletePictureModalState({ imageIndex: -1, show: false }) }}
                show={deletePictureModalState.show}
            />
        </div >
    )
}

export interface UpdateProfileProps {
    id: number,
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
