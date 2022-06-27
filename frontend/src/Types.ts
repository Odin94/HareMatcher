export class Vaccination {
    constructor(public disease: string, public date: string) { }
}

export class ProfilePicture {
    constructor(public picture: string, public index: number) { }
}

export class ProfileData {
    constructor(public id: number, public name: string, public city: string, public race: string, public furColor: string,
        public age: number, public weightInKG: number, public description: string, public vaccinations: Vaccination[], public matchable: boolean, public pictures?: ProfilePicture[]) { }

    static fromJson(json: any): ProfileData {
        const sortedPictures = json.profilePictures?.sort((a: ProfilePicture, b: ProfilePicture) => a.index - b.index);

        return new ProfileData(json.id, json.name, json.city, json.race, json.furColor, json.age, json.weightInKG, json.description, json.vaccinations, json.matchable, sortedPictures);
    }
}

export class UserData {
    constructor(public id: number, public name: string, public email: string, public description: string, public picture: string, public profileIds: number[], public givenSwipeIds: number[], public isMe: boolean) { }

    static fromJson(json: any): UserData {
        return new UserData(json.id, json.name, json.email, json.description, json.picture, json.profileIds, json.givenSwipeIds, json.isMe);
    }
}

export interface NavBarProps {
    children: React.ReactNode
}