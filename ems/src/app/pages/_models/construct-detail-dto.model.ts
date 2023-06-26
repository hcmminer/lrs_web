import {Validators} from '@angular/forms';

export class ConstructionDetailDTO {
  constructionDetailId?: number;
  constructionId?: number;
  constructionItemId?: number;
  startDate?: string;
  startDateStr?: string;
  createdBy?: string;
  status?: number;
  name?: string;
  statusName?: string;
  acceptanceDate?: string;
  acceptanceDateStr?: string;
  acceptanceBy?: string;
  firstApprovedDate?: string;
  firstApprovedDateStr?: string;
  firstApprovedBy?: string;
  firstRejectDateStr?: string;
  firstRejectBy?: string;
  firstRejectReason?: string;
  secondApprovedDate?: string;
  secondApprovedDateStr?: string;
  secondApprovedBy?: string;
  secondRejectDate?: string;
  secondRejectBy?: string;
  secondRejectReason?: string;
  thirdApprovedDate?: string;
  thirdApprovedDateStr?: string;
  thirdApprovedBy?: string;
  thirdRejectDate?: string;
  thirdRejectBy?: string;
  thirdRejectReason?: string;

  listItemDetailDTO?: any;
}
