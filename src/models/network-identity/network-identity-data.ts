import { Color } from "../color";

export class NetworkIdentityData {
    color: Color;

    constructor(color: Color = Color.random()) {
        this.color = color;
    }
}
