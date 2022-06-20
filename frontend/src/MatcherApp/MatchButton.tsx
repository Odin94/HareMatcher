import { faHeart } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { useRepeat } from "../CustomHooks";
import { range } from "../Globals";


const heartCount = 5;
const defaultText = (<span><FontAwesomeIcon icon={faHeart} style={{ marginRight: "10px" }} />Match Me!</span>);

const MatchButton: React.FC<MatchButtonProps> = ({ swipe, onSwipeComplete = () => { } }: MatchButtonProps) => {
    const [text, setText] = useState(defaultText);
    const [heartAnimationEnabled, setHeartAnimationEnabled] = useState(false);
    const [heartAnimationIteration, setHeartAnimationIteration] = useState(0);

    const resetComponent = () => {
        setText(defaultText);
        setHeartAnimationEnabled(false);
        setHeartAnimationIteration(0);
    }

    useRepeat(async () => {
        const hearts = range(0, heartAnimationIteration).map(i => (
            <FontAwesomeIcon key={`${heartAnimationIteration}_${i}`} icon={faHeart} />
        ));

        setText(<span>{hearts}</span>);
        setHeartAnimationIteration(heartAnimationIteration + 1);

        if (heartAnimationIteration == heartCount - 1) {
            setHeartAnimationEnabled(false);
            onSwipeComplete();
            resetComponent();
        }
    }, 100, heartAnimationEnabled);


    return (
        <button
            onClick={() => {
                console.log("click!")
                swipe("LIKE");
                if(heartAnimationIteration === 0) setHeartAnimationEnabled(true);
            }}
            className="btn btn-danger btn-lg rounded-pill"
            type="button"
            style={{ float: "right", margin: "10px", width: "160px" }}>
            {text}
        </button>
    )
}

export interface MatchButtonProps {
    swipe: (likeOrPass: "LIKE" | "PASS") => void,
    onSwipeComplete?: () => void
}

export default MatchButton;