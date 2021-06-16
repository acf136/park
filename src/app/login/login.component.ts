import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { IUser } from 'src/shared/interfaces/interfaces';
import { LoadingService } from 'src/shared/services/Loading.service';
import { UserService } from 'src/shared/services/user.service';

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
    private userService: UserService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService) { }

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
   * THIS METHOD CHECKS THE USER INPUT WHEN CLICKING THE SIGN IN BUTTON
   * 
   * NOTA: HE AÑADIDO EL SERVICIO LoadingService EN SHARED>SERVICES, EL CUAL PODEMOS UTILIZAR
   * A PARTIR DE AHORA PARA MOSTRAR SPINNERS DE CARGA CUANDO LA APP SE ESPERE A RECIBIR DATOS
   * DE UN SERVIDOR O UNA API REST
   * 
   * @returns 
   */
  public submitForm(){
    //init spinner
    this.loadingService.present();
    this.isSubmitted = true;
    //Form not valid
    if (!this.loginForm.valid) {
      console.log('Please provide all the required values!');
      //stop spinner
      this.loadingService.dismiss();
      return false;
    } else {
      //Form valid
      const email = this.loginForm.get('email').value;
      const password = this.loginForm.get('password').value;
      
      this.userService.getUsers().subscribe((list: IUser[]) => {
        //stop spinner
        this.loadingService.dismiss();
        list.forEach(element => {
          //Check if user input exists on the API rest json
          if (element.email == email && element.password == password) 
          {
            console.log("usuario correcto");
            //TODO: Go to the next page: PAGINA O COMPONENTE CON SIDEMENU Y LOS 2 TABS
            this.router.navigate(['/tabs']);
          }
        });
      }, (err) => {
        //stop spinner
        this.loadingService.dismiss();
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