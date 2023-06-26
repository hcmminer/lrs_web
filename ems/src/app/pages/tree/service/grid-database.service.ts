import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TreeConstructItemlDTO} from '../model/tree-construct-item-dto.model';

@Injectable()
export class GridDatabase {

    dataChangeP = new BehaviorSubject<TreeConstructItemlDTO[]>([]);

    get dataP(): TreeConstructItemlDTO[] { return this.dataChangeP.value; }

    constructor() {
        // this.initialize();
    }

    treeDataP: any[];
    initialize( treeDataP: any) {
        this.treeDataP = treeDataP;
        // Notify the change.
        this.dataChangeP.next(treeDataP);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    buildFileTree(obj: {[key: string]: any}, level: number): TreeConstructItemlDTO[] {
        return Object.keys(obj).reduce<TreeConstructItemlDTO[]>((accumulator, key) => {
            const node = new TreeConstructItemlDTO();
            const value = obj[key];
            node.constructionItemName = key;
            if (value != null) {
                if (typeof value === 'object') {
                    node.lstConstructionItem2 = this.buildFileTree(value, level + 1);
                } else {
                    node.constructionItemName = value;
                }
            }
            return accumulator.concat(node);
        }, []);
    }
}
