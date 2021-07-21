import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from 'src/shared/services/Loading.service';
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
    public authService: AuthenticationService) { }

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
      let newEmail = this.loginForm.get('email').value;
      let newPassword =  this.loginForm.get('password').value;
      await this.authService.signIn(newEmail, newPassword).then(
        (resolve) => {                                                      //onfulfilled
          localStorage.setItem('user', JSON.stringify(resolve.user));
          this.router.navigate(['tabs']);
        } ,
        (reject)  => console.log('Reject authService.signIn :  ' +reject)   //onrejected
      );
    }
    this.loadingService.dismiss();       //stop spinner
  }

  public forgotPasswordClicked() {
    this.router.navigate(['/forgot-password']);
  }

}
