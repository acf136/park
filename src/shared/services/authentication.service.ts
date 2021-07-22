import { Injectable, NgZone } from '@angular/core';
import { IUser } from '../../shared/interfaces/interfaces';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userData: any;

  constructor(
    public afStore: AngularFirestore,
    public ngFireAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) { }

  // Login in with email/password -sync mode - call   await signIn . . .
   async signIn(email, password) {  //Promise<firebase.auth.UserCredential>/
    return this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  // Register user with email/password
  registerUser(email, password) {
    return this.ngFireAuth.createUserWithEmailAndPassword(email, password);
  }

  updateAuthPassword(password) {
    return this.ngFireAuth.currentUser.then(u => u.updatePassword(password)).then(
        (resolve) => {} ,
        (reject)  => console.log(reject)
      );
  }

  sendVerificationMail() {
    return this.ngFireAuth.currentUser.then(u => u.sendEmailVerification())
    .then(() => {
    this.router.navigate(['verify-email-address']);
    });
  }

  // Recover password
  passwordRecover(passwordResetEmail) {
    return this.ngFireAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email has been sent, please check your inbox.');
    }).catch((error) => {
      window.alert(error);
    });
  }

  // Returns true when user is looged in
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null /*&& user.emailVerified !== false*/) ? true : false;
  }

  // Returns true when user's email is verified
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user.emailVerified !== false) ? true : false;
  }

  // Sign in with Gmail
  googleAuth() {
    return this.authLogin(new firebase.auth.GoogleAuthProvider());
  }

  // Auth providers
  authLogin(provider) {
    return this.ngFireAuth.signInWithPopup(provider)
      .then( (result) => {
        this.ngZone.run( () =>  this.router.navigate(['dashboard']) );

        this.setUserData(result.user);
      }).catch((error) => {
          window.alert(error);
        });
  }

  // Store user in localStorage
  setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const userData: IUserLS = {
      idUser: user.uid,
      email: user.email,
      password: user.password,
      name: user.name,
      surname: user.surname,
      envioDisponibilidad: true,
      envioInformes: true
    };
    return userRef.set(userData, {
      merge: true
    });
  }

  /**
   * Log out current user and modify localstorage accordingly
   */
  signOut() {
    return this.ngFireAuth.signOut().then( (resolve) => localStorage.removeItem('user') );
  }

  async signOutSync() {   // Promise<void>
    await this.ngFireAuth.signOut();
    localStorage.removeItem('user');
  }

}

export interface IUserLS {
  idUser: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  envioDisponibilidad: boolean;
  envioInformes: boolean;
}
