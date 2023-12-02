import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class UserData {
    @PrimaryKey()
    id!: string;

    @Property({
        type: "json"
    })
    data: {
        [key: string]: any
    }

    constructor(id: string) {
        this.id = id;
        this.data = {};
    }

    get(key: string) {
        return this.data[key];
    }

    set(key: string, value: any) {
        this.data[key] = value;
    }

    get properties() {
        return Object.keys(this.data);
    }
}