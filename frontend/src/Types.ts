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
        const picturesBase64 = json.profilePictures
            ?.sort((a: ProfilePicture, b: ProfilePicture) => a.index - b.index)
            ?.map((p: ProfilePicture) => new ProfilePicture("data:image/jpg;base64," + p.picture, p.index));

        return new ProfileData(json.id, json.name, json.city, json.race, json.furColor, json.age, json.weightInKG, json.description, json.vaccinations, json.matchable, picturesBase64);
    }
}

export interface NavBarProps {
    children: React.ReactNode
}