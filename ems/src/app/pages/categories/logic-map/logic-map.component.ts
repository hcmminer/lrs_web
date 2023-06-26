import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {LogicMapService} from '../../_services/logic-map.service';
import {DetailLogicMapComponent} from './detail-logic-map/detail-logic-map.component';
import {Subscription} from 'rxjs';
import {ResponseModel} from '../../_models/response.model';
import {ServiceModel} from '../../_models/service.model';
import {SystemManagementModel} from '../../_models/system-categories.model';

@Component({
  selector: 'app-logic-map',
  templateUrl: './logic-map.component.html',
  styleUrls: ['./logic-map.component.scss']
})
export class LogicMapComponent implements OnInit, OnDestroy, AfterViewInit {
  listSystem = [];
  private subscriptions: Subscription[] = [];
  isOpenMenu = true;
  @ViewChild('icon_menu') icMenu: ElementRef;
  @ViewChild('content') vc_content: ElementRef;

  constructor(
      private modalService: NgbModal,
      private fb: FormBuilder,
      public translateService: TranslateService,
      public logicMapService: LogicMapService
  ) {
  }

  ngOnInit(): void {
    this.logicMapService.listLogicMap.next([]);
    this.isOpenMenu = true;
    const lsb = this.logicMapService.getListSystemBox({pageLimit: 1000, currentPage: 1, status: 'O', typeRequest: 'COMBOBOX'}).subscribe(
        (res: ResponseModel) => {
          if (!res.status) {
            throw new Error(res.message);
          } else {
            this.logicMapService.cbxSystem.next(res.data as SystemManagementModel[]);
            this.logicMapService.cbxSystem.value.forEach(value => {
              this.listSystem.push(value.systemId);
              value.check = true;
            });
            this.logicMapService.getLogicMap({Ids: this.listSystem});
            console.log(this.listSystem);
          }
        }
    );
    this.subscriptions.push(lsb);
    this.logicMapService.getListColor({pageLimit: 1000, currentPage: 1, status: 'O'});
  }

  onCheckSystem(index, val) {
    if (this.listSystem[index] == null) {
      this.listSystem[index] = val;
    } else {
      this.listSystem[index] = null;
    }
    console.log(this.listSystem);
    const querry = this.listSystem.filter((el) =>
        el != null
    );
    this.logicMapService.getLogicMap({Ids: querry});
  }

  eViewDetail(serviceCode: string) {
    const modalRef = this.modalService.open(DetailLogicMapComponent, {size: 'md'});
    modalRef.componentInstance.serviceCode = serviceCode;
  }

  ngAfterViewInit() {
    // console.log(this.icMenu.nativeElement.offsetHeight);
    // console.log(this.vc_content.nativeElement.offsetHeight);
    // this.icMenu.nativeElement.style.top = '100px';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
