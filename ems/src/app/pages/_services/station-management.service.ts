import {Injectable} from '@angular/core';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {Station} from '../_models/station.model';
import {HTTPService} from './http.service';
import {ToastrService} from 'ngx-toastr';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RequestApiModel} from '../_models/request-api.model';
import {catchError, finalize, map} from 'rxjs/operators';
import * as moment from 'moment';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthService} from '../../modules/auth';

@Injectable({
  providedIn: 'root',
})

export class StationManagementService{
  subscriptions: Subscription[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  listStation = new BehaviorSubject<Station[]>([]);
  listInfrastructureType = new BehaviorSubject([]);
  listPositionType = new BehaviorSubject([]);
  listPillarType = new BehaviorSubject([]);
  listStationType = new BehaviorSubject([]);
  listConstructionType = new BehaviorSubject([]);
  listProvince = new BehaviorSubject([]);
  listDistrict = new BehaviorSubject([]);
  listConstructionStatus = new BehaviorSubject([]);
  //
  conId = new BehaviorSubject(null);
  infrastructureType = new BehaviorSubject('');
  provinceSelected = new BehaviorSubject('');
  stationName = new BehaviorSubject('');
  stationCode = new BehaviorSubject('');
  status = new BehaviorSubject<number>(null);
  listCategories = new BehaviorSubject([]);
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

  formatDate(x){
    if(x){
      return moment.utc(x).local().format('DD/MM/yyyy HH:mm:ss');
    }
    else return '';
  }
}
