import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {Station} from '../_models/station.model';
import {HTTPService} from './http.service';
import {ToastrService} from 'ngx-toastr';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RequestApiModel} from '../_models/request-api.model';
import {catchError, finalize, map} from 'rxjs/operators';
import * as moment from 'moment';
import {DataUtilities} from '../../utils/data';
import {CONFIG} from '../../utils/constants';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthService} from '../../modules/auth';
import {FileSaver} from '../../_metronic/shared/file-saver';

@Injectable({
  providedIn: 'root',
})

export class StationReportService{
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  listProvince = new BehaviorSubject([]);
  initHeader: {};
  reportTypes = [
    {
      CODE: 'MONTHLY_REPORT',
      NAME: 'Báo cáo hàng tháng',
      TITLE: 'Báo cáo hàng tháng'
    }, {
      CODE: 'PROV_REPORT',
      NAME: 'Báo cáo tỉnh',
      TITLE: 'Báo cáo tỉnh'
    },
    {
      CODE: 'ANNUAL_REPORT',
      NAME: 'Báo cáo hàng năm',
      TITLE: 'Báo cáo hàng năm'
    }, {
      CODE: 'ACCUM_REPORT',
      NAME: 'Báo cáo lũy kế',
      TITLE: 'Báo cáo lũy kế'
    },
  ];
  chooseReportType = new BehaviorSubject<string>(this.reportTypes[0].CODE);
  header = {
    'Content-Type': 'application/json'
  };

  header2 = {
    'Content-Type': 'multipart/form-data'
  };

  constructor(
    public httpService: HTTPService,
    public toastrService: ToastrService,
    public http: HttpClient,
    public spinner: NgxSpinnerService,
    public authService: AuthService
  ) {
    const token = localStorage.getItem(CONFIG.KEY.TOKEN);
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    this.initHeader = {
      Authorization: `Bearer ${token}`,
      'Accept-Language': language,
      ...this.header
    };
  }

  callAPICommon(request: RequestApiModel): any {
    this.spinner.show();
    const url = `${environment.apiUrl}/redirectFunction`;
    return this.httpService.post(url, request, {headers: new HttpHeaders(this.header)}).pipe(
      map((response: any) => {
        if (response.errorCode == '2') {
          this.toastrService.error('Phiên của bạn đã hết hạn, vui lòng đăng nhập lại');
          this.authService.logout();
          window.location.href = 'auth/login';
        }
        return response;
      }),
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message);
        this.spinner.hide();
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading.next(false);
        this.spinner.hide();
      })
    );
  }

  callAPICreateFile(formData: FormData, func): any {
    this.spinner.show();
    const url = `${environment.apiUrl}/` + func;
    return this.httpService.post(url, formData, null).pipe(
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message);
        this.spinner.hide();
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading.next(false);
        this.spinner.hide();
      })
    );
  }

  searchReport(params: any, reportTypePath: string) {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${reportTypePath}`;
    return this.http.get(
      // tslint:disable-next-line:max-line-length
      url + '&p_from_date=' + params.p_from_date + '&p_to_date=' + params.p_to_date + ((params.p_pro ? ('&p_pro=' + params.p_pro) : '')),
      {headers: new HttpHeaders(this.initHeader), responseType: 'text'},
    ).pipe(catchError(err => {
      this.toastrService.error(err.error?.message || err.message, 'Error');
      return of({id: undefined});
    }));
  }

  exportReport(params: any, reportTypePath: string): Observable<any> {
    this.isLoading.next(true);
    const url = `${environment.apiUrl}${reportTypePath}`;
    return this.http.get(
      // tslint:disable-next-line:max-line-length
      url + '&p_from_date=' + params.p_from_date + '&p_to_date=' + params.p_to_date + ((params.p_pro ? ('&p_pro=' + params.p_pro) : '')),
      {headers: new HttpHeaders(this.initHeader), responseType: 'blob', observe: 'response'},
    ).pipe(catchError(err => {
      this.toastrService.error(err.error?.message || err.message, 'Error');
      return of({id: undefined});
    }));
  }

  // exportReport(params: any, reportTypePath: string) {
  //   this.isLoading.next(true);
  //   const url = `${environment.apiReportUrl}${reportTypePath}`;
  //   // tslint:disable-next-line:max-line-length
  //   window.open(url + '&p_from_date=' + params.p_from_date + '&p_to_date=' + params.p_to_date + ((params.p_pro ? ('&p_pro=' + params.p_pro) : '')), '_blank');
  //   this.isLoading.next(false);
  // }

  // saveFile(name, type, data) {
  //   if (data !== null && navigator.msSaveBlob) {
  //     return navigator.msSaveBlob(new Blob([data], {type}), name);
  //   }
  //   let link = document.createElement('a');
  //   link.setAttribute('type', 'hidden');
  //   let url = window.URL.createObjectURL(new Blob([data], {type}));
  //   link.setAttribute('href', url);
  //   link.setAttribute('download', name);
  //   document.body.append(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   window.URL.revokeObjectURL(url);
  // }

  saveFile(name, data) {
    const fileSaver: any = new FileSaver();
    fileSaver.responseData = data.body;
    fileSaver.strFileName = name;
    fileSaver.strMimeType = 'application/vnd.ms-excel;charset=utf-8';
    fileSaver.initSaveFile();
  }

}
