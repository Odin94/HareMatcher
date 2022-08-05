import "react-multi-carousel/lib/styles.css";
import 'react-image-lightbox/style.css';
import '../index.css';
import UserPage from "./UserPage";


export default function Me() {
    return (
        <UserPage userId={"me"} />
    )
}
