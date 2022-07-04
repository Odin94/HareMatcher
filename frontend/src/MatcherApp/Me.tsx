import "react-multi-carousel/lib/styles.css";
import 'react-image-lightbox/style.css';
import '../index.css';
import User from "./User";


export default function Me() {
    return (
        <User userId={"me"} />
    )
}
