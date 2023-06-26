import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable, Input, OnInit, Output, ViewChild, EventEmitter, ElementRef} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeNestedDataSource} from '@angular/material/tree';
import {TranslateService} from '@ngx-translate/core';
import {StationDetailService} from '../../station-management/station-detail/station-detail.component';
import {ChecklistDatabase} from '../service/checklist-database.service';
import {TreeConstructItemlDTO, TreeConstructItemlDTOFlat} from '../model/tree-construct-item-dto.model';
import {GridDatabase} from '../service/grid-database.service';

/**
 * @title Tree with checkboxes
 */
@Component({
    selector: 'app-tree-checklist',
    templateUrl: './tree-checklist.component.html',
    styleUrls: ['./tree-checklist.component.scss'],
    providers: [ChecklistDatabase, GridDatabase],
})
export class TreeChecklistComponent implements OnInit{
    @Input() treeData: TreeConstructItemlDTO[];

    @ViewChild('keySearch') keySearch: ElementRef;
    get treeDataAdd(): TreeConstructItemlDTO[] {return this.stationDetailService.treeDataAdd;}
    treeControl: FlatTreeControl<TreeConstructItemlDTOFlat>;
    dataSource: MatTreeFlatDataSource<TreeConstructItemlDTO, TreeConstructItemlDTOFlat>;
    checklistSelection = new SelectionModel<TreeConstructItemlDTOFlat>(true /* multiple */);
    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<TreeConstructItemlDTOFlat, TreeConstructItemlDTO>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<TreeConstructItemlDTO, TreeConstructItemlDTOFlat>();

    treeFlattener: MatTreeFlattener<TreeConstructItemlDTO, TreeConstructItemlDTOFlat>;

    searchString = '';

    // Preview
    treeDataP: TreeConstructItemlDTO[];
    treeControlP: FlatTreeControl<TreeConstructItemlDTOFlat>;
    dataSourceP: MatTreeFlatDataSource<TreeConstructItemlDTO, TreeConstructItemlDTOFlat>;
    flatNodeMapP = new Map<TreeConstructItemlDTOFlat, TreeConstructItemlDTO>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMapP = new Map<TreeConstructItemlDTO, TreeConstructItemlDTOFlat>();

    treeFlattenerP: MatTreeFlattener<TreeConstructItemlDTO, TreeConstructItemlDTOFlat>;

    constructor(private database: ChecklistDatabase,
                public translate: TranslateService,
                private stationDetailService: StationDetailService,
                private databaseP: GridDatabase
    ) {
        this.treeFlattener = new MatTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren,
        );
        this.treeControl = new FlatTreeControl<TreeConstructItemlDTOFlat>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
        database.dataChange.subscribe(data => {
            this.dataSource.data = data;
            this.dataSource._flattenedData.value.forEach(item => {
                if (item.chosen === 1) {
                    this.checklistSelection.toggle(item);
                }
            });
        });
        // Preview
        this.treeFlattenerP = new MatTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren,
        );
        this.treeControlP = new FlatTreeControl<TreeConstructItemlDTOFlat>(this.getLevel, this.isExpandable);
        this.dataSourceP = new MatTreeFlatDataSource(this.treeControlP, this.treeFlattenerP);
        databaseP.dataChangeP.subscribe(dataP => {
            this.dataSourceP.data = dataP;
        });
    }
    ngOnInit() {
        this.database.initialize(this.treeData);
        this.stationDetailService.treeDataAdd = this.treeData;
        this.treeDataP = this.removeAllDeselected();
        this.databaseP.initialize(this.treeDataP);
        this.treeControlP.expandAll();
    }

    getLevel = (node: TreeConstructItemlDTOFlat) => node.level;

    isExpandable = (node: TreeConstructItemlDTOFlat) => node.expandable;

    getChildren = (node: TreeConstructItemlDTO): TreeConstructItemlDTO[] => node.lstConstructionItem2;

    hasChild = (_: number, _nodeData: TreeConstructItemlDTOFlat) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: TreeConstructItemlDTOFlat) => _nodeData.constructionItemId === null;

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: TreeConstructItemlDTO, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode =
            existingNode && existingNode.constructionItemId === node.constructionItemId ? existingNode : new TreeConstructItemlDTOFlat();
        flatNode.constructionItemId = node.constructionItemId;
        flatNode.constructionItemName = node.constructionItemName;
        flatNode.step = node.step;
        flatNode.status = node.status;
        flatNode.chosen = node.chosen;
        flatNode.lastModifiedBy = node.lastModifiedBy;
        flatNode.type = node.type;
        flatNode.lstConstructionItem2 = node.lstConstructionItem2;
        flatNode.level = level;
        flatNode.expandable = !!node.lstConstructionItem2?.length;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: TreeConstructItemlDTOFlat): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every(child => {
                return this.checklistSelection.isSelected(child);
            });
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: TreeConstructItemlDTOFlat): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }
    todoChildSelectionToggle(node: TreeConstructItemlDTOFlat): void {
        this.checklistSelection.toggle(node);
        const parent: TreeConstructItemlDTOFlat | null = this.getParentNode(node);
        // while (parent) {
        //     this.checkRootNodeSelection(parent);
        //     parent = this.getParentNode(parent);
        // }
        if (parent) {
            const descendants = this.treeControl.getDescendants(parent);
            const isSelectedParent = descendants.some(item => {
                return this.checklistSelection.isSelected(item);
            });
            if (isSelectedParent) {
                if (!this.checklistSelection.isSelected(parent)) {
                    this.checklistSelection.toggle(parent);
                }
                this.replaceItem(null, parent);
            }
        }
        this.replaceItem(parent, node);

        // Add item to treeDataP
        this.updateLstPreview(node, parent);
    }
    todoItemSelectionToggle(node: TreeConstructItemlDTOFlat): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        if (!this.checklistSelection.isSelected(node)) {
            this.checklistSelection.deselect(...descendants);
            descendants.forEach(item => {
                if (item.chosen === 1) {
                    this.replaceItem(node, item);
                }
            });
        }
        this.replaceItem(null, node);
        this.updateLstPreview(node, null);
        // this.checklistSelection.isSelected(node)
        //     ? this.checklistSelection.select(...descendants)
        //     : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        // descendants.forEach(child => this.checklistSelection.isSelected(child));
        // this.checkAllParentsSelection(node);
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    // todoLeafItemSelectionToggle(node: TreeData): void {
    //     this.checklistSelection.toggle(node);
    //     this.checkAllParentsSelection(node);
    // }
    /* Checks all the parents when a leaf node is selected/unselected */
    // checkAllParentsSelection(node: TreeData): void {
    //     let parent: TreeData | null = this.getParentNode(node);
    //     while (parent) {
    //         this.checkRootNodeSelection(parent);
    //         parent = this.getParentNode(parent);
    //     }
    // }
    /** Check root node checked state and change it accordingly */
    // checkRootNodeSelection(node: TreeData): void {
    //     const nodeSelected = this.checklistSelection.isSelected(node);
    //     const descendants = this.treeControl.getDescendants(node);
    //     const descAllSelected =
    //         descendants.length > 0 &&
    //         descendants.every(child => {
    //             return this.checklistSelection.isSelected(child);
    //         });
    //     if (nodeSelected && !descAllSelected) {
    //         this.checklistSelection.deselect(node);
    //     } else if (!nodeSelected && descAllSelected) {
    //         this.checklistSelection.select(node);
    //     }
    // }
    /* Get the parent node of a node */
    getParentNode(node: TreeConstructItemlDTOFlat): TreeConstructItemlDTOFlat | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }
        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    replaceItem(parent: TreeConstructItemlDTOFlat, node: TreeConstructItemlDTOFlat): void {
        if (!parent) {
            this.treeDataAdd.forEach(parentOld => {
                if (parentOld.constructionItemId === node.constructionItemId) {
                    const indexP = this.treeDataAdd.indexOf(parentOld);
                    parentOld.chosen = this.checklistSelection.isSelected(node) ? 1 : 0;
                    this.treeDataAdd[indexP] = parentOld;
                }
            });
        } else {
            this.treeDataAdd.forEach(parentOld => {
                if (parentOld.constructionItemId === parent.constructionItemId) {
                    const indexP = this.treeDataAdd.indexOf(parentOld);
                    parentOld.lstConstructionItem2.forEach(nodeOld => {
                        if (nodeOld.constructionItemId === node.constructionItemId){
                            const indexC = parentOld.lstConstructionItem2.indexOf(nodeOld);
                            nodeOld.chosen = this.checklistSelection.isSelected(node) ? 1 : 0;
                            parentOld.lstConstructionItem2[indexC] = nodeOld;
                            this.treeDataAdd[indexP] = parentOld;
                        }
                    });
                }
            });
        }
        // Preview
    }
    // search filter logic start
    searchTree(event: any) {
        this.searchString = this.keySearch.nativeElement.value;
        if (this.searchString)
        {
            this.treeControl.expandAll();
            this.treeControlP.expandAll();
        } else {
            this.treeControl.collapseAll();
            this.treeControlP.collapseAll();
        }
    }
    filterLeafNode(node: TreeConstructItemlDTOFlat): boolean {
        if (!this.searchString) {
            return false;
        }
        return node.constructionItemName.toLowerCase()
            .indexOf(this.searchString?.toLowerCase()) === -1;

    }

    filterParentNode(node: TreeConstructItemlDTOFlat): boolean {

        if ( !this.searchString || node.constructionItemName.toLowerCase().indexOf(this.searchString?.toLowerCase()) !== -1 ) {
            return false;
        }
        const descendants = this.treeControl.getDescendants(node);
        if (
            descendants.some(
                (descendantNode) =>
                    descendantNode.constructionItemName
                        .toLowerCase()
                        .indexOf(this.searchString?.toLowerCase()) !== -1
            )
        ) {
            return false;
        }

        return true;
    }
    // search filter logic end

    filterParentNodeP(node: TreeConstructItemlDTOFlat): boolean {

        if ( !this.searchString || node.constructionItemName.toLowerCase().indexOf(this.searchString?.toLowerCase()) !== -1 ) {
            return false;
        }
        const descendants = this.treeControlP.getDescendants(node);
        if (
            descendants.some(
                (descendantNode) =>
                    descendantNode.constructionItemName
                        .toLowerCase()
                        .indexOf(this.searchString?.toLowerCase()) !== -1
            )
        ) {
            return false;
        }

        return true;
    }

    // Preview data checked
    removeAllDeselected(): TreeConstructItemlDTO[] {
        const treeDataTmpP = [];
        const dataInput = this.dataSource._flattenedData.value;
        dataInput.forEach(parentItem => {
            if (parentItem.level === 0 && this.checklistSelection.isSelected(parentItem)) {
                const descendants = this.treeControl.getDescendants(parentItem);
                const lstChildSelected = [];
                descendants.forEach(child => {
                    if (this.checklistSelection.isSelected(child)){
                        lstChildSelected.push(this.convertFlatToDTO(child));
                    }
                });
                parentItem.lstConstructionItem2 = lstChildSelected;
                treeDataTmpP.push(this.convertFlatToDTO(parentItem));
            }
        });
        return treeDataTmpP;
    }
    updateLstPreview(nodeI: TreeConstructItemlDTOFlat, parentI: TreeConstructItemlDTOFlat) {
        const node = nodeI;
        const parent = parentI;
        if (parent) {
            let index = -1;
            this.treeDataP.forEach( parentItem => {
                if (parentItem.constructionItemId === parent.constructionItemId){
                    index = this.treeDataP.indexOf(parentItem);
                }
            });
            if (this.checklistSelection.isSelected(parent)) {
                const descendants = this.treeControl.getDescendants(parent);
                const lstChildSelected = [];
                descendants.forEach(child => {
                    if (this.checklistSelection.isSelected(child)){
                        lstChildSelected.push(this.convertFlatToDTO(child));
                    }
                });
                // const parentTmp = parent;
                // parentTmp.lstConstructionItem2 = lstChildSelected;
                if (index >= 0) {
                    this.treeDataP[index].lstConstructionItem2 = lstChildSelected;
                }else {
                    // const parentTmp = this.convertFlatToDTO(parent);
                    parent.lstConstructionItem2 = lstChildSelected;
                    this.treeDataP.push(this.convertFlatToDTO(parent));
                }
            } else {
                if (index >= 0) {
                    const descendants = this.treeControl.getDescendants(parent);
                    const lstChildSelected = [];
                    descendants.forEach(child => {
                        if (this.checklistSelection.isSelected(child)){
                            lstChildSelected.push(this.convertFlatToDTO(child));
                        }
                    });
                    this.treeDataP[index].lstConstructionItem2 = lstChildSelected;
                }
            }
        } else {
            let index = -1;
            this.treeDataP.forEach(nodeItem => {
                if (nodeItem.constructionItemId === node.constructionItemId) {
                    index = this.treeDataP.indexOf(nodeItem);
                }
            });
            if (this.checklistSelection.isSelected(node)) {
                if (index < 0) {
                    const descendants = this.treeControl.getDescendants(node);
                    const lstChildSelected = [];
                    descendants.forEach(child => {
                        if (this.checklistSelection.isSelected(child)){
                            lstChildSelected.push(this.convertFlatToDTO(child));
                        }
                    });
                    node.lstConstructionItem2 = lstChildSelected;
                    this.treeDataP.push(this.convertFlatToDTO(node));
                }
            } else {
                if (index >= 0) {
                    this.treeDataP.splice(index, 1);
                }
            }
        }
        this.databaseP.initialize([]);
        this.databaseP.initialize(this.treeDataP);
        this.treeControlP.expandAll();
    }
    convertFlatToDTO(flatNode: TreeConstructItemlDTOFlat): TreeConstructItemlDTO {
        const dto = new TreeConstructItemlDTO();
        dto.constructionItemId = flatNode.constructionItemId;
        dto.constructionItemName = flatNode.constructionItemName;
        dto.step = flatNode.step;
        dto.status = flatNode.status;
        dto.chosen = flatNode.chosen;
        dto.lastModifiedBy = flatNode.lastModifiedBy;
        dto.type = flatNode.type;
        dto.lstConstructionItem2 = flatNode.lstConstructionItem2;
        return dto;
    }
}
