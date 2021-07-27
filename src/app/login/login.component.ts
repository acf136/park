import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from 'src/shared/services/Loading.service';
import { NavigationService } from 'src/shared/services/navigation.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

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

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private navigation: NavigationService,
    public authService: AuthenticationService
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
      const newEmail = this.loginForm.get('email').value;
      const newPassword =  this.loginForm.get('password').value;
      await this.authService.signIn(newEmail, newPassword).then(
        (resolve) => {                                                      //onfulfilled
          localStorage.setItem('user', JSON.stringify(resolve.user));
          this.router.navigate(['tabs']);
        } ,
        (reject)  => window.alert('Reject authService.signIn :  ' +reject)   //onrejected
      );
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
