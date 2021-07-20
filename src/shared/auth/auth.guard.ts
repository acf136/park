import { Injectable, Input } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  @Input() password = '123456' ;
  email = 'administrator@ggg.com' ;
  isTheAdmin = false;

  constructor( public angularFireAuth: AngularFireAuth ,
               public authenticationService: AuthenticationService,
    ) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot ):  Promise<boolean>
  {
    prompt("Enter administrator password : ", "password here");
    // get login of administrator from AuthService but not change user state in app
    const currentUser = JSON.parse(localStorage.getItem('user'));
    await this.angularFireAuth.signInWithEmailAndPassword(this.email, this.password).then(
      (result) =>  this.isTheAdmin = true,                   //onfullfilled
      (error)  =>  this.isTheAdmin = false                   //onRejected
    );
    await this.authenticationService.signOutSync().then( (resolve) => localStorage.setItem('user', JSON.stringify(currentUser))  );
    // TODO: if this.isTheAdmin === false  enviar un msg a  modify-park component to set backdropEnabled to true
    //            en vez de impedir que entre en modificación.
    return  this.isTheAdmin;
  }

}
