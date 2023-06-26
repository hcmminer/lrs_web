
export class ActionCategoriesModel{
  categoryId?: number;
  categoryCode?: string;
  categoryName?: string;
  status?: string;
  description?: string;
  createBy?: string;
  createDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

export class ActionModel{
  actionId?: number;
  actionCode?: string;
  actionName?: string;
  categoryId?: number;
  actionType?: string;
  referActionCode?: string;
  description?: string;
  status?: string;
  createBy?: string;
  lastModifiedBy?: string;

  // add
  category?: string;
}
