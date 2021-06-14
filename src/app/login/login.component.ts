import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private router: Router,
    private userService:UserService,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    console.log("Login loaded");

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(2)]],
    })
  }

  /**
   * 
   * 
   * @returns 
   */
  public submitForm(){
    //init spinner
    this.isSubmitted = true;
    if (!this.loginForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      const email = this.loginForm.get('email').value;
      const password = this.loginForm.get('password').value;
      
      this.userService.getUsers().subscribe((list: IUser[]) => {
        //stop spinner
        list.forEach(element => {
          //Vemos si el email y contraseña proporcionados por el usuario existen (y coinciden) en la api rest
          if (element.email == email && element.password == password) 
          {
            console.log("todo correcto");
            //Ir a la siguiente pantalla
          }
        });
      }, (err) => {
        //stop spinner
        console.error(err);
      });
    }
  }

  public forgotPasswordClicked()
  {
    this.router.navigate(['/forgot-password']);
  }

}
