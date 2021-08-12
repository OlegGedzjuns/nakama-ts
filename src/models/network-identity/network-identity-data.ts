import { Vec3 } from '../../libs/playcanvas';
import { Color } from '../color';

export class NetworkIdentityData {
    color: Color | undefined;

    position: Vec3 | undefined = new Vec3();
}
