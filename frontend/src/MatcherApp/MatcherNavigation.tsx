import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { apiVersion, baseUrl } from "../Globals";
import { NavBarProps } from "../Types";


const MatcherNavigation: React.FC<NavBarProps> = ({ children }) => {
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
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to={"/"}>HareMatcher</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to={"/signup"}>Signup</Nav.Link>
                        <Nav.Link as={Link} to={"/login"}>Login</Nav.Link>
                        <Nav.Link onClick={logout}>Logout</Nav.Link>
                        <Nav.Link as={Link} to={"/discover"}>Discover</Nav.Link>
                        <Nav.Link as={Link} to={"/matches"}>Matches</Nav.Link>
                    </Nav>
                    <Nav className="ml-auto">
                        <Nav.Link as={Link} to={"/me"}>Me</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <div style={{ padding: "20px" }}>
                {children}
            </div>
        </div>
    )
}

export default MatcherNavigation;