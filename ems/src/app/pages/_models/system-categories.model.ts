import {NgbDate} from '@ng-bootstrap/ng-bootstrap';

export class SystemCategoriesModel {
  id?: number;
  code?: string;
  name?: string;
  status?: string;
  description?: string;
  endDate?: string;
}

export class SystemManagementModel {
  systemId?: number;
  systemCategoryId?: number;
  parentId?: number;
  collectType?: number;
  systemCode?: string;
  systemName?: string;
  description?: string;
  endDate?: string;
  ivalidEndate?: NgbDate;
  orderNo?: number;
  numChildLevel?: number;
  status?: string;
  // add
  systemCategory?: string;
  parentSystem?: string;
  // check
  check?: boolean;
}
