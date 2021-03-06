import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User, UserResponse } from '../../domain/models/user.model';
import { catchError, map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthGateWay } from '../../domain/services/auth-gateway';

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root'
})

export class AuthService extends AuthGateWay{
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http:HttpClient) {
    super();
    this.checkToken();
   }

   get isLogged():Observable<boolean>{
    return this.loggedIn.asObservable();
  }

  login(authData:User): Observable<UserResponse | void> {
    return this.http
    .post<UserResponse>(`${environment.API_ULR}/auth/login`,authData)
    .pipe(
      map((res:UserResponse) => {
        localStorage.setItem('role', res.role.toString());
        this.saveToken(res.token);
        this.loggedIn.next(true);
        return res;
      }),
      catchError((err) => this.handlerError(err))
    );
  }

  logout():void{
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  checkToken():boolean{
    const userToken = localStorage.getItem('token') || '';
    const isExpired = helper.isTokenExpired(userToken);
    isExpired ? this.logout() : this.loggedIn.next(true);
    return !isExpired;
  }

  private saveToken(token: string):void{
    localStorage.setItem('token', token);
  }

  private handlerError(err: { message: any; }): Observable<never>{
    let errorMessage = 'An error ocurred';
    if (err) {
      errorMessage = `Error: code ${err.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

}
