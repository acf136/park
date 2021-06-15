import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { IUser } from 'src/shared/interfaces/interfaces';
import { UserService } from 'src/shared/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isSubmitted = false;
  loading: HTMLIonLoadingElement;
  form: any;

  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController) { }

  ngOnInit() {
    console.log("Login loaded");

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(2)]],
    })

    this.form = [
      { val: 'Envio disponibilidad', isChecked: false },
      { val: 'Envio informes', isChecked: false }
    ];
  }

  /**
   * THIS METHOD INVOKES A SPINNER (LOADING...)
   */
  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...'      
    });
    await this.loading.present();
    console.log('Loading presented!');
  }

  /**
   * THIS METHOD FINISHES THE INVOKED SPINNER
   */
  async dismissLoading() {
    await this.loading.dismiss();
    console.log('Loading dismissed!');
  }

  /**
   * THIS METHOD CHECKS THE USER INPUT WHEN CLICKING THE SIGN IN BUTTON
   * 
   * @returns 
   */
  public submitForm(){
    //init spinner
    (async () => await this.presentLoading())();
    this.isSubmitted = true;
    //Form not valid
    if (!this.loginForm.valid) {
      console.log('Please provide all the required values!');
      //stop spinner
      (async () => await this.dismissLoading())();
      return false;
    } else {
      //Form valid
      const email = this.loginForm.get('email').value;
      const password = this.loginForm.get('password').value;
      
      this.userService.getUsers().subscribe((list: IUser[]) => {
        //stop spinner
        (async () => await this.dismissLoading())();
        list.forEach(element => {
          //Check if user input exists on the API rest json
          if (element.email == email && element.password == password) 
          {
            console.log("usuario correcto");
            //TODO: Go to the next page
          }
        });
      }, (err) => {
        //stop spinner
        (async () => await this.dismissLoading())();
        console.error(err);
      });
    }
  }

  public forgotPasswordClicked()
  {
    this.router.navigate(['/forgot-password']);
  }

}

//comentario