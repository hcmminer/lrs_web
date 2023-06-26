import {Component, Input, OnInit} from '@angular/core';
import {DashboardDetailModel} from '../../_models/Dashboard.model';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {CONFIG} from '../../../utils/constants';

@Component({
  selector: 'app-alarm-viewer',
  templateUrl: './alarm-viewer.component.html',
  styleUrls: ['./alarm-viewer.component.scss']
})
export class AlarmViewerComponent implements OnInit {
  @Input() dashboardDetailModel: DashboardDetailModel;
  actionTypeProduct = CONFIG.ACTION_TYPE.PRODUCT;
  clearStatus = CONFIG.CLR_STATUS.CLEAR;
  actionTypeAction = CONFIG.ACTION_TYPE.ACTION;
  actionTypeName: string;
  clearStatusName: string;
  eventTimeFormat: string;

  constructor(
      public modal: NgbActiveModal,
      public translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    if (this.dashboardDetailModel.actionType === this.actionTypeProduct) {
      this.actionTypeName = 'Product';
    } else {
      this.actionTypeName = 'Action';
    }
    if (this.dashboardDetailModel.clearStatus === this.clearStatus) {
      this.clearStatusName = 'CLEAR';
    } else {
      this.clearStatusName = 'NOT CLEAR';
    }
    if (this.dashboardDetailModel.eventTime != null && this.dashboardDetailModel.eventTime !== '') {
      const format1 = this.dashboardDetailModel.eventTime.split('T');
      const format2 = format1[0].split('-').reverse().join('-');
      this.eventTimeFormat = format2 + ' ' + format1[1];
    }
    console.log(this.dashboardDetailModel);
  }

}
