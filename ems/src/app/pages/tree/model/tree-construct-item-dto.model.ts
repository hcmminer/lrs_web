export class TreeConstructItemlDTO {
    public constructionItemId: number;
    public constructionItemName: string;
    public step: number;
    public status: number;
    public chosen: number;
    public lastModifiedBy: string;
    public type: number;
    public lstConstructionItem2: TreeConstructItemlDTO[];
}

export class TreeConstructItemlDTOFlat {
    public constructionItemId: number;
    public constructionItemName: string;
    public step: number;
    public status: number;
    public chosen: number;
    public lastModifiedBy: string;
    public type: number;
    public lstConstructionItem2: TreeConstructItemlDTO[];

    public expandable: boolean;
    public level: number;
}
