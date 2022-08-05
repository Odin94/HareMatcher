import { useParams } from 'react-router';
import "react-multi-carousel/lib/styles.css";
import 'react-image-lightbox/style.css';
import '../index.css';
import UserPage from "./UserPage";


export default function SpecificUser() {
    const { id } = useParams();

    return (
        <UserPage userId={id!!} />
    )
}