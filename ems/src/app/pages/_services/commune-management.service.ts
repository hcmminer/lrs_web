import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/modules/auth';
import { BehaviorSubject, of } from 'rxjs';
import { RequestApiModel } from '../_models/request-api.model';
import { environment } from 'src/environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class CommuneManagementService {
  isLoading = new BehaviorSubject<boolean>(false);
  public cbxProvices = new BehaviorSubject<any[]>([]);
  public listCommune = new BehaviorSubject<any[]>([]);
  public cbxCommunes = new BehaviorSubject<any[]>([]);




  header = {
    'Content-Type': 'application/json'
  };
  constructor(
    public httpService: HTTPService,
    public toastrService: ToastrService,
    public http: HttpClient,
    public spinner: NgxSpinnerService,
    public authService: AuthService,
    public translateService:TranslateService,
  ) {
  }

  callAPICommon(request: RequestApiModel): any {
    this.spinner.show();
    const url = `${environment.apiUrl}/redirectFunction`;
    return this.httpService.post(url, request, {headers: new HttpHeaders(this.header)}).pipe(
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

  getcbxProvinces(request: RequestApiModel, allowDDefault:boolean){
    this.callAPICommon(request).subscribe(res =>{
      if(res.errorCode == "0"){
        this.cbxProvices.next(res.data)
        if(allowDDefault){
          this.cbxProvices.value.unshift({
            proId: '',
            proCode: this.translateService.instant('DEFAULT_OPTION.SELECT'),
          });
        }
      }else {
        this.cbxProvices.next([]);
        this.toastrService.error(res.description);
      }
    })
  }

  getcbxCommunes(request: RequestApiModel, allowDDefault:boolean){
    this.callAPICommon(request).subscribe(res =>{
      if(res.errorCode == "0"){
        this.cbxCommunes.next(res.data);
        if(allowDDefault){
          this.cbxCommunes.value.unshift({
            distId: '',
            districtName: this.translateService.instant('DEFAULT_OPTION.SELECT'),
          });
        }
      }else {
        this.cbxCommunes.next([]);
        this.toastrService.error(res.description);
      }
    })
  }
}
