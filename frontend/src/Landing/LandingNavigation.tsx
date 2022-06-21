import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { NavBarProps } from "../Types";


const LandingNavigation: React.FC<NavBarProps> = ({ children }) => {
    return (
        <div>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to={"/"}>HareMatcher</Navbar.Brand>
                    <Nav className="ml-auto">
                        <Nav.Link as={Link} to={"/login"}>Login</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <div style={{ padding: "20px" }}>
                {children}
            </div>
        </div>
    )
}

export default LandingNavigation;