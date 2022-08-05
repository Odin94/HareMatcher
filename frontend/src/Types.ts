import * as yup from 'yup';

export const vaccinationSchema = yup.object().shape({
    disease: yup.string().required().min(1),
    date: yup.string().required().min(1),  // TODO: require correct length
});

export type Vaccination = yup.InferType<typeof vaccinationSchema>;

export const profilePictureSchema = yup.object().shape({
    picture: yup.string().required().matches(new RegExp("/.*/")),  // TODO: validate that this is a picture
    index: yup.number().required().min(0).integer(),
});

export type ProfilePicture = yup.InferType<typeof profilePictureSchema>;

export const profileSchema = yup.object().shape({
    id: yup.number().required().min(0).integer(),
    name: yup.string().required().min(1),
    city: yup.string().required().min(1),
    race: yup.string().required().min(1),
    furColor: yup.string().required().min(1),
    age: yup.number().required().min(0).integer(),
    weightInKG: yup.number().required().min(0).integer(),
    description: yup.string().required(),
    vaccinations: yup.array().of(vaccinationSchema),
    matchable: yup.bool().required(),
    profilePictures: yup.array().of(profilePictureSchema).nullable(),
});

export type Profile = yup.InferType<typeof profileSchema>;

export const userSchema = yup.object().shape({
    id: yup.number().required().min(0).integer(),
    name: yup.string().required().min(1),
    email: yup.string().required().email(),
    description: yup.string().required(),
    picture: yup.string().required().matches(new RegExp("/.*/")),  // TODO: validate that this is a picture
    profileIds: yup.array().of(yup.number().required().min(0).integer()),
    givenSwipeIds: yup.array().of(yup.number().required().min(0).integer()),
    isMe: yup.bool().required(),
});

export type User = yup.InferType<typeof userSchema>;

export interface NavBarProps {
    children: React.ReactNode
}

export const chatRoomSchema = yup.object().shape({
    user: userSchema,
    profile: profileSchema,
    messageCount: yup.number().integer().min(0).required(),
    lastMessageOn: yup.string().required().min(1),  // TODO: require correct length
});

export type ChatRoom = yup.InferType<typeof chatRoomSchema>;
