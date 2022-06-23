import '../index.css';
import { UserData } from "../Types";

const User: React.FC<UserProps> = ({ user, fetchError }) => {
    return (
        <div>
            {fetchError
                ? <h1>{fetchError}</h1>
                : <div className="container" style={{ width: "50%", margin: "0 auto" }}>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <h1>{ }</h1>

                                    <p>This user has not set up their profile properly yet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "20px" }}>
                        <div className="col">
                            <div className="card">
                                <h5 className="card-header">Description</h5>
                                <div className="card-body">
                                    <p style={{ fontSize: "1.23rem" }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eget pharetra augue. Fusce lectus lorem, suscipit vitae consequat blandit, dignissim ac metus. Fusce sodales, orci quis varius sollicitudin, orci metus aliquet urna, sit amet varius nunc nibh non augue. Donec porta consequat urna malesuada iaculis. Nulla sit amet sem congue felis sagittis imperdiet nec et dui. In cursus, dolor venenatis bibendum hendrerit, turpis ante porta massa, et tempus nisl quam in nibh</p>

                                    <p style={{ fontSize: "1.23rem" }}>Proin convallis dui ut pharetra venenatis. Vivamus id faucibus sem. Nunc blandit pellentesque facilisis. Etiam egestas et mauris eget convallis. Aliquam laoreet egestas neque, eget ornare odio faucibus et. Donec placerat eros neque, sit amet egestas mi auctor a. Nulla gravida velit enim, vitae sodales odio egestas </p>
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