import { hashCode } from '../Globals';
import '../index.css';
import { UserData } from "../Types";

const User: React.FC<UserProps> = ({ user, fetchError }) => {
    return (
        <div>
            {fetchError
                ? <h1>{fetchError}</h1>
                : <div className="container container-xxl" style={{ margin: "0 auto" }}>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <h1 className="card-header">{user.name}</h1>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col d-flex flex-column justify-content-center">{user.description.split("\n\n").map((paragraph) => (
                                            <p key={hashCode(paragraph)} style={{ fontSize: "1.23rem" }}>{paragraph}</p>
                                        ))}
                                        </div>
                                        <div className="col"><img src={user.picture} alt={`Picture of user ${user.name}`} width="100%" height="500px" style={{ padding: "5px", objectFit: "cover", maxWidth: "900px" }}></img></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ul>{user.profileIds?.map((profileId) => <li key={profileId}><a href={`/profile/${profileId}`}>{profileId}</a></li>)}</ul>

                    {user.isMe
                        ? <a href={`/profile/create`}>create new profile</a>
                        : <div></div>
                    }

                </div>
            }
        </div>
    )
}

export interface UserProps {
    user: UserData,
    fetchError?: string
}


export default User;