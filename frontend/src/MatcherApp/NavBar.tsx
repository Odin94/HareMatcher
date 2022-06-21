import { Link } from "react-router-dom";
import { apiVersion, baseUrl } from "../Globals";


const NavBar: React.FC<NavBarProps> = ({ children }) => {
    const logout = () => {
        fetch(`${baseUrl}/api/${apiVersion}/logout`, {
            method: "POST",
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
            })
            .catch(err => alert(err))
    }

    return (
        <div>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/signup">Signup</Link></li>
                    <li><Link to="/login">Login</Link></li>
                    <li><a href='/' onClick={logout}>Logout</a></li>
                    <li><Link to="/me">My Profile</Link></li>
                    <li><Link to="/discover">Discover</Link></li>
                    <li><Link to="/matches">Matches</Link></li>
                </ul>
            </nav>
            {children}
        </div>
    )
}

interface NavBarProps {
    children: React.ReactNode
}

export default NavBar;