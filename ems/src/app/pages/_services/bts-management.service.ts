import {Injectable} from '@angular/core';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {HTTPService} from './http.service';
import {ToastrService} from 'ngx-toastr';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BTS} from '../_models/bts.model';
import { RequestApiModel } from '../_models/request-api.model';
import { environment } from 'src/environments/environment';
import {catchError, finalize, map} from 'rxjs/operators';
import { B } from '@angular/cdk/keycodes';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthService} from '../../modules/auth';

@Injectable({
  providedIn: 'root',
})

export class BtsManagementService{
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  btnSave = new BehaviorSubject<boolean>(false);
  itemToUpdate = new BehaviorSubject({});
  
  listStation = new BehaviorSubject<BTS[]>([]);
  listStationStatus = new BehaviorSubject([]);
  listApprovedStatus = new BehaviorSubject([]);
  listProvince = new BehaviorSubject([]);
  listDistrict = new BehaviorSubject([]);
  listYesOrNo = new BehaviorSubject([])

  //
  
  stationCode = new BehaviorSubject('');
  stationName = new BehaviorSubject('');
  stationStatusSelected =  new BehaviorSubject(null)
  provinceSelected = new BehaviorSubject('');
  districtSelected = new BehaviorSubject('');
  approvedStatusSelected = new BehaviorSubject(null);
  hasCRFile = new BehaviorSubject<number>(null);
  hasContractFile = new BehaviorSubject<number>(null);
  header = {
    'Content-Type': 'application/json'
  };
  constructor(
    public httpService: HTTPService,
    public toastrService: ToastrService,
    public http: HttpClient,
    public spinner: NgxSpinnerService,
    public authService: AuthService
  ) {
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

  callAPIUploadFile(formData: FormData, func, stationId, fileType): any {
    this.spinner.show();
    const url = `${environment.apiUrl}/` + func + '?btsStationId=' + stationId + '&type=' + fileType;
    return this.httpService.post(url, formData, null).pipe(
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

  numberWithCommas(x) {
    if (x) {
      return this.replaceNumber(x.toString().split(',').join(''));
    } else {
      return '0';
    }
  }

  replaceNumber(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
