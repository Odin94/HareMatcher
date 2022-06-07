import { useEffect, useState } from "react";
import { apiVersion, baseUrl } from "../Globals";
import '../index.css';



const defaultEmptyPictureSource = "https://images.unsplash.com/photo-1610559176044-d2695ca6c63d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80";
const secondPictureSource = "https://images.unsplash.com/photo-1654077013798-8465c12f9672?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80";

export default function Profile() {
    const [userData, setUserData] = useState(new UserData("", "", []));
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        fetch(`${baseUrl}/api/${apiVersion}/users/me`, {
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

    return (
        <div>
            {fetchError
                ? <h1>{fetchError}</h1>
                : <div className="container" style={{ width: "50%", margin: "0 auto" }}>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <h1>{}</h1>

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

                                </div>
                            </div>
                        </div>
                    </div>

                    <ul>{userData.profileIds?.map((profileId) => <li key={profileId}><a href={`/profile/${profileId}`}>{profileId}</a></li>)}</ul>

                    <a href={`/profile/create`}>create new profile</a>
                </div>
            }
        </div>
    )
}

class UserData {
    constructor(public name: string, public email: string, public profileIds: number[]) { }
}
