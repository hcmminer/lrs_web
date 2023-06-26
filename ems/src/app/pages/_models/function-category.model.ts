import {NgbDate} from '@ng-bootstrap/ng-bootstrap';

export class FunctionCategoryModel {
  categoryId?: number;
  categoryCode?: string;
  categoryName?: string;
  validToDate?: string;
  validTo?: NgbDate;
  validFromDate?: string;
  validFrom?: NgbDate;
  description?: string;
  parentId?: string;
  status?: string;
}
