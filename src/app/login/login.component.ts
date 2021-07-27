import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from 'src/shared/interfaces/interfaces';
import { LoadingService } from 'src/shared/services/Loading.service';
import { NavigationService } from 'src/shared/services/navigation.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { FirestoreUserService } from 'src/shared/services/firestore-user.service';
import { PushNotifService } from 'src/shared/services/push-notif.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  form: any;
  myUserLogin: IUser ;
  dateIni1 = new Date(1900,1,1);
  dateIni2 = new Date(1900,1,1);
  //  if ( !(this.dateIni1 < this.dateIni2) && !(this.dateIni1 > this.dateIni2) ) // entonces son iguales
  //  esto se lee, si no es menor ni es mayor es igual
  //  NO UTILIZAR this.dateIni1 != this.dateIni2
  // también se puede utilizar this.dateIni1.toString() === this.dateIni2.toString()

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private navigation: NavigationService,
    public authService: AuthenticationService,
    public firestoreUserService: FirestoreUserService,
    public pushNotifService: PushNotifService,
    ) { }

  ngOnInit() {
    // console.log("Login loaded");
    // Persistence: si logged cuando cerraron y arrancamos la app otra vez
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/tabs']); //
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.form = [
      { val: 'Envio disponibilidad', isChecked: false },
      { val: 'Envio informes', isChecked: false }
    ];
  }

  /**
   * THIS METHOD CHECKS THE USER INPUT WHEN CLICKING THE SIGN IN BUTTON
   *
   * @returns
   */
  async submitForm() {
    this.loadingService.present();   //init spinner
    this.isSubmitted = true;
    //Form not valid
    if ( !this.loginForm.valid ) alert('Please provide all the required values!');
    else { // ( this.loginForm.valid )
      if ( !this.authService.isLoggedIn ) {
        const newEmail = this.loginForm.get('email').value;
        const newPassword =  this.loginForm.get('password').value;
        await this.authService.signIn(newEmail, newPassword).then(
          (resolve) => {                                                      //onfulfilled
            localStorage.setItem('user', JSON.stringify(resolve.user));
            this.pushNotifService.registerNotifEnvDisp();                    // register to push-notifications
            console.log('Login.component:submitForm: registerNotifEnvDisp:after!' );
            this.router.navigate(['tabs']);
          } ,
          (reject)  => window.alert('Reject authService.signIn :  ' +reject)   //onrejected
        );
      } else {
        console.log('Already logged. Trying to log again!' );
      }
    }

    this.loadingService.dismiss();       //stop spinner
  }

  public forgotPasswordClicked() {
    this.router.navigate(['/forgot-password']);
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    // return mode === 'ios' ? 'Back' : 'Back';
    return 'Back';  //no 'Back' text for the moment
  }

  // [defaultHref]="getBackRoute()"
  getBackRoute(){
    // use the navigationService to get the last route into backRoute
    const backRoute = this.navigation.history[this.navigation.history.length - 2];
    if ( !backRoute || !this.authService.isLoggedIn )  return '/' ; // only one route in history
    else   return backRoute;
  }

}
