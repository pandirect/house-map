import {Store} from "../../entities/store";
import {action, observable} from "mobx";
import {IItem} from "./MapWrapper";
import {get} from "lodash";
import {EFormType} from "./interfaces";
import {Nullable} from "../../react-app-env";

export class MapStore extends Store {
    @observable items: IItem[] = [];
    @observable mode: EFormType = EFormType.NONE;
    @observable selectedItem: Nullable<IItem> = void 0;
    @observable curPos: number[] = [];

    @observable filterTypes: number[] = [];
    @observable filterSpecializations: number[] = [];

    @action.bound
    setTypes(types: number[]) {
        this.filterTypes = types;
    }

    @action.bound
    setSpecializations(values: number[]) {
        this.filterSpecializations = values;
    }

    getItems(): IItem[] {
        return this.items
            .filter((item) => {
                return !!(~this.filterTypes.indexOf(item.type));
            })
            .filter((item) => {
                return !!(~this.filterSpecializations.indexOf(item.specialization));
            })
    }

    @action.bound
    setCurPos(pos: number[]) {
        this.curPos = pos;
    }

    @action.bound
    selectItem(item: Nullable<IItem>) {
        this.selectedItem = item;
    }

    @action.bound
    setMode(mode: EFormType) {
        this.mode = mode;
    }

    @action.bound
    setItems(items: IItem[]) {
        this.items = [...this.items, ...items];
    }

    @action.bound
    changeItems(items: IItem[]) {
        this.items = items;
    }

    getPoints() {
        this.asyncCall(this.transport.getPoints()).then((data) => {
            const items = get(data, "data", []);
            this.setItems(items);
        })
    }

    createPoint(data: object) {
        const params = {
            ...data,
            positionx: this.curPos[0],
            positiony: this.curPos[1],
            status: 1
        };
        this.asyncCall(this.transport.createPoint(params))
            .then((response) => {
                console.info("[MapStore.createPoint]", response);
                const item = get(response, "data");
                this.setItems([item]);
                this.selectItem(item);
            })
            .then(() => this.setMode(EFormType.VIEW))
    }

    editPoint(data: object) {
        if (!this.selectedItem) {
            return;
        }
        this.asyncCall(this.transport.updatePoint(this.selectedItem.id, data))
            .then((response) => {
                console.info("[MapStore.editPoint]", response);
                const item = get(response, "data");
                const items = this.items.filter((value) => item.id !== value.id);
                this.changeItems([...items, item]);
                this.selectItem(item);
            })
            .then(() => this.setMode(EFormType.VIEW))
    }

    removePoint() {
        const selectedItem = this.selectedItem;
        if (!selectedItem) {
            return;
        }
        this.asyncCall(this.transport.removePoint(selectedItem.id))
            .then(() => {
                const items = this.items.filter((value) => selectedItem.id !== value.id);
                this.changeItems(items);
                this.selectItem(void 0);
            })
    }
}