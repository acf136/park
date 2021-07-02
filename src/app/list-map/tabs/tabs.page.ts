import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthenticationService } from 'src/shared/services/authentication.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit{
  constructor(private menu: MenuController,
    public authService: AuthenticationService) { }

  ngOnInit(): void {
    console.log("after login (ngOnInit): " + this.authService.isLoggedIn);
  }

  ionViewWillEnter(){
    console.log("after login (will enter): " + this.authService.isLoggedIn);
  }

  ionViewDidEnter(){
    // cambia la propiedad disabled del tag html  <ion-menu> en app.component.html
    // <ion-menu contentId="main-content" type="overlay" disabled="true" menuId="main-content">
    this.menu.enable(true, 'main-content');
    console.log("after login (did enter): " + this.authService.isLoggedIn);
  }

  ionViewWillLeave(){
    console.log("after login (will leave): " + this.authService.isLoggedIn);
  }

  ionViewDidLeave(){
    this.menu.enable(false, 'main-content');
    console.log("after login (did leave): " + this.authService.isLoggedIn);
  }

}
