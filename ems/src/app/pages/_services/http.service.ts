import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ResponseModel} from '../_models/response.model';
import {CONFIG} from '../../utils/constants';
import {AuthService} from '../../modules/auth';
import {ToastrService} from 'ngx-toastr';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HTTPService {
  initHeader: {};
  checkError = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient,
              private toastrService: ToastrService) {
    const token = localStorage.getItem(CONFIG.KEY.TOKEN);
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    this.initHeader = {
      Authorization: `Bearer ${token}`,
      'Accept-Language': language,
    };
  }

  // public methods
  post(url: string, data: {}, headers: {}): Observable<ResponseModel> {
    headers = {
      ...headers,
      ...this.initHeader
    };

    return this.http.post<ResponseModel>(url, data, { headers: new HttpHeaders(headers) });
  }

  get(url: string, params: {}, headers: {}): Observable<ResponseModel> {
    headers = {
      ...headers,
      ...this.initHeader
    };

    return this.http.get<ResponseModel>(url, {
      headers: new HttpHeaders(headers),
      params
    });
  }

  getReport(url: string, params: {}, headers: {}): Observable<string> {
    headers = {
      ...headers,
      ...this.initHeader
    };

    return this.http.get<string>(url, {
      headers: new HttpHeaders(headers),
      params
    });
  }
}
