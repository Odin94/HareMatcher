import { useQuery } from "react-query";
import { apiVersion, baseUrl } from "./Globals";
import { ProfileData, UserData } from "./Types";


export interface UserQueryResult {
    isUserLoading: boolean,
    userError: Error | string | any,
    user?: UserData,
}

export const useUser = (userId: string | number): UserQueryResult => {
    const { isLoading, error, data } = useQuery("user", () => fetchUser(userId));

    return { isUserLoading: isLoading, userError: error, user: data };
}

const fetchUser = (userId: string | number) => {
    return fetch(`http://${baseUrl}/api/${apiVersion}/users/${userId}`, {
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
            return response.json();
        })
        .then(json => UserData.fromJson(json))
}


export interface ProfileQueryResult {
    isProfileLoading: boolean,
    profileError: Error | string | any,
    profile?: ProfileData
}

export const useProfile = (profileId: number): ProfileQueryResult => {
    const { isLoading, error, data } = useQuery("profile", () => fetchProfile(profileId));

    return { isProfileLoading: isLoading, profileError: error, profile: data };
}

const fetchProfile = (profileId: string | number) => {
    return fetch(`http://${baseUrl}/api/${apiVersion}/profiles/${profileId}`, {
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
            return response.json();
        })
        .then(json => ProfileData.fromJson(json));
}

export interface ProfilesQueryResult {
    isProfileLoading: boolean,
    profileError: Error | string | any,
    profiles?: ProfileData[]
}

export const useProfiles = (user: UserData | undefined): ProfilesQueryResult => {
    const { isLoading, error, data } = useQuery("profiles", () => fetchProfiles(user!!.id), {
        enabled: !!user,
    });

    return { isProfileLoading: isLoading, profileError: error, profiles: data };
}

const fetchProfiles = (userId: number) => {
    return fetch(`http://${baseUrl}/api/${apiVersion}/users/${userId}/profiles`, {
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
            return response.json();
        })
        .then(json => json.map((profileJson: any) => ProfileData.fromJson(profileJson)));
}
