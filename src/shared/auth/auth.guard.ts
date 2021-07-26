import { Injectable, Input, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthenticationService } from '../services/authentication.service';
import { MessageService } from 'src/shared/services/message.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate,OnDestroy {
  @Input() password = '123456' ;
  email = 'administrator@ggg.com' ;
  isTheAdmin = false;
  // message management
  messages: any[] = [];
  subscription: Subscription;

  constructor( public angularFireAuth: AngularFireAuth ,
               public authenticationService: AuthenticationService,
               private messageService: MessageService
    ) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot ):  Promise<boolean>
  {
    this.password = prompt("Enter administrator password : ", "password here");
    // get login of administrator from AuthService but not change user state in app
    const currentUser = JSON.parse(localStorage.getItem('user'));
    await this.angularFireAuth.signInWithEmailAndPassword(this.email, this.password).then(
      (result) =>  this.isTheAdmin = true,                   //onfullfilled
      (error)  =>  this.isTheAdmin = false                   //onRejected
    );
    if ( this.isTheAdmin ) {
      await this.authenticationService.signOutSyncAdmin().then( (resolve) => localStorage.setItem('user', JSON.stringify(currentUser))  );
    }
    // Should backdropEnabled?
    this.subscription = this.messageService.onMessage().subscribe(
      (msg) => {
        if (!this.isTheAdmin && msg.text === 'Should backdropEnabled?')  this.messageService.sendMessage('this.backdropEnabled = true;') ;
      }
    );

    return true;
  }

  // Tasks to clean class
  ngOnDestroy() {
    this.subscription.unsubscribe();  // unsubscribe to ensure no memory leaks
  }
}
