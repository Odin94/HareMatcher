import 'react-image-lightbox/style.css';
import "react-multi-carousel/lib/styles.css";
import { useParams } from 'react-router';
import '../index.css';
import ProfilePage from "./ProfilePage";


export default function SpecificProfile() {
    const { id } = useParams();

    return (
        <div>
            <ProfilePage profileId={parseInt(id!)} />
        </div>
    )
}
