import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(private menu: MenuController) { }

  ionViewDidEnter(){
    // cambia la propiedad disabled del tag html  <ion-menu> en app.component.html
    // <ion-menu contentId="main-content" type="overlay" disabled="true" menuId="main-content">
    this.menu.enable(true, 'main-content');
  }

  ionViewDidLeave(){
    this.menu.enable(false, 'main-content');
  }


}
