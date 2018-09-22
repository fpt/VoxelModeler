

interface ICube {
    x: number;
    y: number;
    z: number;
    objs?: any[];
    id: number;
}

interface IModel {
  [key:string]: ICube;
}

class Model {
    private _m: IModel = {};
    private _arr: ICube[] = [];

    add(x: number, y: number, z: number, objs?: any[]) {
        const idx = `x${x}_y${y}_z${z}`;

        if (idx in this._m) {
            return this._m[idx];
        }

        const m = { x, y, z, objs, id: -1 };
        this._m[idx] = m;
        const id = this._arr.push(m);
        m.id = id;

        return m;
    }

    at(x: number, y: number, z: number) {
        const idx = `x${x}_y${y}_z${z}`;

        return this._m[idx];
    }

    remove(x: number, y: number, z: number) {
        const idx = `x${x}_y${y}_z${z}`;

        const m = this._m[idx];
        delete this._m[idx];

        return m;
    }

    all() {
        return Object.keys(this._m).map(k => this._m[k]);
    }
}

export { Model };
