import {Component, Input, OnInit} from '@angular/core';
import {DashboardDetailModel} from '../../_models/Dashboard.model';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {DashboardOnlineService} from '../../_services/dashboard-online.service';
import {AlarmViewerComponent} from '../alarm-viewer/alarm-viewer.component';
import { ResponseModel } from 'src/app/modules/auth/_models/response.model';

@Component({
  selector: 'app-alarm-group',
  templateUrl: './alarm-group.component.html',
  styleUrls: ['./alarm-group.component.scss']
})
export class AlarmGroupComponent implements OnInit {
  @Input() id: number;
  total = 0;

  constructor(
      public modal: NgbActiveModal,
      public translateService: TranslateService,
      public dashboardOnlineService: DashboardOnlineService,
      private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.dashboardOnlineService.getAlarmDetailGroup(this.id).subscribe((res: ResponseModel) => {
      if (!res.status) {
        throw new Error(res.message);
      } else {
        this.dashboardOnlineService.listDashboardGroup.next(res.data as DashboardDetailModel[]);
        this.total = this.dashboardOnlineService.listDashboardGroup.value.length;
        this.setColorInRow();
      }
    });
    // this.dashboardOnlineService.listDashboardGroup.next(this.dashboardOnlineService.listDashboardDetail.value.filter(
    //     (value) => value.alarmId.toString() === this.id.toString()));
  }

  eViewDetail(dashboardDetailModel: DashboardDetailModel) {
    const modalRef = this.modalService.open(AlarmViewerComponent, {size: 'xl', backdrop: 'static', keyboard: false});
    modalRef.componentInstance.dashboardDetailModel = dashboardDetailModel;
    // modalRef.result.then(() => this.dashboardOnlineService.getListDashboardDetail(this.query), () => {
    // });
  }

  setColorInRow() {
    // this.dashboardOnlineService.cbxAlarmSeverity.value.forEach(item => {
    //   item.totalError = 0;
    // });
    this.dashboardOnlineService.listDashboardGroup.value.forEach((value) => {
      const indexSer = this.dashboardOnlineService.listAlarmColor.value.findIndex(
          value1 => value1.alarmSeverityId === value.alarmSeverityId);
      if (indexSer > -1) {
        value.colorCurrentType = this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrentType;
        value.colorCurrent = this.dashboardOnlineService.listAlarmColor.value[indexSer].colorCurrent;
      }
      // this.dashboardOnlineService.cbxAlarmSeverity.value.filter((item) => {
      //   if (item.alarmSeverityId === value.alarmSeverityId) {
      //     item.totalError++;
      //   }
      // });
    });
  }

}
