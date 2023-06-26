import { Component, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {TreeConstructDetailDTO} from '../model/tree-construct-detail-dto.model';

@Injectable()
export class TableDatabase {
    dataChange = new BehaviorSubject<TreeConstructDetailDTO[]>([]);

    get data(): TreeConstructDetailDTO[] {
        return this.dataChange.value;
    }

    constructor() {
        // this.initialize();
    }
    treeData: any[];
    initialize( treeData: any) {
        this.treeData = treeData;
        // const data = this.buildFileTree(this.treeData, 0);

        // Notify the change.
        this.dataChange.next( this.treeData);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    buildFileTree(obj: object, level: number): TreeConstructDetailDTO[] {
        return Object.keys(obj).reduce<TreeConstructDetailDTO[]>((accumulator, key) => {
            const value = obj[key];
            const node = new TreeConstructDetailDTO();
            node.name = key;

            if (value != null) {
                if (typeof value === 'object') {
                    node.listItemDetailDTO = this.buildFileTree(value, level + 1);
                } else {
                    node.name = value;
                }
            }

            return accumulator.concat(node);
        }, []);
    }
}
