import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {StationReportService} from '../../_services/station-report.service';
import {RequestApiModel} from '../../_models/request-api.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup ;
  value: any;
  isSelectService: any;
  constructor(
    private fb: FormBuilder,
    public rpService: StationReportService
  ) { }
  chooseReportType = new BehaviorSubject<string>('');
  ngOnInit(): void {
    this.rpService.chooseReportType = new BehaviorSubject<string>(this.rpService.reportTypes[0].CODE);
    this.isSelectService = this.rpService.reportTypes[0].CODE;
    this.getListProvince().subscribe(res => {
      if(res.errorCode == '0'){
        this.rpService.listProvince.next(res.data);
      }
    });

  }

  getListProvince(){
    const requestTarget = {
      functionName: 'getListProvince'
    }
    return this.rpService.callAPICommon(requestTarget as RequestApiModel);
  }

  changeService(val: any) {
    this.rpService.chooseReportType.next(val);
    this.isSelectService = val;
  }

}
