import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {LogicMapService} from '../../../_services/logic-map.service';
import {DashboardOnlineService} from '../../../_services/dashboard-online.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-detail-logic-map',
  templateUrl: './detail-logic-map.component.html',
  styleUrls: ['./detail-logic-map.component.scss']
})
export class DetailLogicMapComponent implements OnInit {
  @Input() serviceCode: string;

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public translateService: TranslateService,
      public logicMapService: LogicMapService,
      public dashboardOnlineService: DashboardOnlineService,
      private router: Router,
      public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.logicMapService.getListCountSeverity({serviceCode: this.serviceCode});
  }

  eDetail(){
    this.dashboardOnlineService.serviceCode = this.serviceCode;
    this.router.navigate(['dashboard-management/dashboard-detail']);
    this.modal.close();
  }
}
