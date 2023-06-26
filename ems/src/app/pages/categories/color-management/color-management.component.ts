import {Component, OnDestroy, OnInit} from '@angular/core';
import {CONFIG} from '../../../utils/constants';
import {PaginatorState} from '../../../_metronic/shared/crud-table';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ErrorCategoriesService} from '../../_services/error-categories.service';
import {ColorPickerEventArgs} from '@syncfusion/ej2-angular-inputs';
import { AlarmColorModel } from '../../_models/error-categories.model';
import { UpdateAlarmColorModalComponent } from './update-alarm-color-modal/update-alarm-color-modal.component';

const queryInit = {
  pageLimit: CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT,
  currentPage: CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT,
  code: null,
  name: null
};

@Component({
  selector: 'app-alarm-color',
  templateUrl: './color-management.component.html',
  styleUrls: ['./color-management.component.scss']
})
export class ColorManagementComponent implements OnInit, OnDestroy {
  query = {
    ...queryInit
  };
  queryReset = {
    code: null,
    name: null
  };
  paginator: PaginatorState;
  isLoading: boolean;
  searchForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
      private modalService: NgbModal,
      public errorCategoriesService: ErrorCategoriesService
  ) {
  }

  ngOnInit(): void {
    // const pa = this.errorCategoriesService.paginatorState.subscribe(res => this.paginator = res);
    const sb = this.errorCategoriesService.isLoading.subscribe(res => this.isLoading = res);
    // this.subscriptions.push(pa);
    this.subscriptions.push(sb);
    // this.query.currentPage = this.paginator.page || CONFIG.PAGINATION.CURRENT_PAGE_DEFAULT;
    // this.query.pageLimit = this.paginator.pageSize || CONFIG.PAGINATION.PAGE_LIMIT_DEFAULT;
    const request = this.errorCategoriesService.getListAlarmColor().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmColor.next(response.data as AlarmColorModel[]);
      }
      // this.errorCategoriesService.paginatorState.next({
      //   page: response.currentPage,
      //   pageSize: response.pageLimit,
      //   total: response.recordTotal
      // } as PaginatorState);
    });
    this.subscriptions.push(request);
  }

  eReset(){
    Object.assign(this.query, this.queryReset);
  }

  // pagination
  // paginate(paginator: PaginatorState) {
  //   this.query.currentPage = paginator.page;
  //   this.query.pageLimit = paginator.pageSize;
  //   this.callApiGetListAlarmColor();
  // }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  getColorValue(rowData: any): string{
    switch(rowData.colorCurrentType){
      case 'HEX':
        return rowData.colorCurrent;
      case 'RGB':
        return this.rgbToHex(rowData.colorCurrent);
    }

    return '';
  }
  
  rgbToHex(rgbStr: string) {
    let rgbArr = rgbStr.split(",");
    return "#" + ((1 << 24) + (+rgbArr[0] << 16) + (+rgbArr[1] << 8) + +rgbArr[2]).toString(16).slice(1);
  }

  hexToRgb(hexStr: string) {
    if(hexStr.length == 4){
      let result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hexStr);
      if(result){
        let r = parseInt(result[1] + result[1], 16);
        let g = parseInt(result[2] + result[2], 16);
        let b = parseInt(result[3] + result[3], 16);
        return r + ',' + g + ',' + b;
      }
    }else if(hexStr.length == 7){
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr);
      if(result){
        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        return r + ',' + g + ',' + b;
      }
    }
    return null;
  }

  changeColor(rowData: any, args: ColorPickerEventArgs): void {
    switch(rowData.colorCurrentType){
      case 'HEX':
        rowData.colorCurrent = args.currentValue.hex;
        break;
      case 'RGB':
        rowData.colorCurrent = this.hexToRgb(args.currentValue.hex);
        break;
    }
  }

  changeColorText(rowData: any, event: any): void {
    let colorValue: string = event.target.value;
    rowData.colorCurrentInput = colorValue;
    switch(rowData.colorCurrentType){
      case 'HEX':
        var regex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/g;
        if(regex.test(colorValue)){
          rowData.colorCurrent = colorValue;
        }
        break;
      case 'RGB':
        var regex = /^(\d{1,3}),(\d{1,3}),(\d{1,3})$/g;
        if(regex.test(colorValue)){
          let arr = colorValue.split(",");
          if(+arr[0] >= 0 && +arr[0] <= 255 && +arr[1] >= 0 && +arr[1] <= 255 && +arr[2] >= 0 && +arr[2] <= 255)
            rowData.colorCurrent = colorValue;
        }
        break;
    }
  }

  isValidColorCodePattern(rowData: any): boolean{
    if(!rowData.colorCurrentInput) return true;
    switch(rowData.colorCurrentType){
      case 'HEX':
        var regex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/g;
        return regex.test(rowData.colorCurrentInput);
      case 'RGB':
        var regex = /^(\d{1,3}),(\d{1,3}),(\d{1,3})$/g;
        if(regex.test(rowData.colorCurrentInput)){
          let arr = rowData.colorCurrentInput.split(",");
          if(+arr[0] >= 0 && +arr[0] <= 255 && +arr[1] >= 0 && +arr[1] <= 255 && +arr[2] >= 0 && +arr[2] <= 255)
            return true;
          else
            return false;
        }else{
          return false;
        }
    }
  }

  changeColorType(rowData: any, event: any): void {
    if(rowData.colorCurrentType == 'RGB' && event.target.value == 'HEX'){
      rowData.colorCurrent = this.rgbToHex(rowData.colorCurrent);
    }else if (rowData.colorCurrentType == 'HEX' && event.target.value == 'RGB'){
      rowData.colorCurrent = this.hexToRgb(rowData.colorCurrent);
    }
    rowData.colorCurrentType = event.target.value;
    rowData.colorCurrentInput = rowData.colorCurrent;
  }

  loadLastColor(){
    const request = this.errorCategoriesService.getListAlarmColor().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmColor.next(response.data as AlarmColorModel[]);
      }
      this.errorCategoriesService.listAlarmColor.value.forEach(item => {
        item.colorCurrent = item.colorLast;
        item.colorCurrentType = item.colorLastType;
      });
    });
    this.subscriptions.push(request);
  }

  loadDefaultColor(){
    const request = this.errorCategoriesService.getListAlarmColor().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmColor.next(response.data as AlarmColorModel[]);
      }
      this.errorCategoriesService.listAlarmColor.value.forEach(item => {
        item.colorCurrent = item.colorDefault;
        item.colorCurrentType = item.colorDefaultType;
      });
    });
    this.subscriptions.push(request);
  }

  updateColor(){
    const modalRef = this.modalService.open(UpdateAlarmColorModalComponent, {backdrop: 'static', keyboard: false});
    // modalRef.componentInstance.id = id;
    modalRef.result.then(() => {
      this.callApiGetListAlarmColor();
    }, () => {
      this.callApiGetListAlarmColor();
    });
  }

  callApiGetListAlarmColor(){
    const request = this.errorCategoriesService.getListAlarmColor().subscribe(response => {
      if (!response.status) {
        throw new Error(response.message);
      }
      if (typeof (response.data) !== 'undefined' && response.data !== null && response.data.toString().length > 0) {
        this.errorCategoriesService.listAlarmColor.next(response.data as AlarmColorModel[]);
      }
    });
    this.subscriptions.push(request);
  }
  
}
