import { Component, Input, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  @Input() langValue: string ;
  currentFlag: string;
  flagLocation = '..\\assets\\flags\\';
  languages: { key: string ; name: string ; flag: string}[] = [
    { key: 'en', name:'Language.English',  flag: 'great-britain-48-flag-color.svg'   },
    { key: 'es', name:'Language.Spanish',  flag: 'spain-48-flag-color.svg'   },
    { key: 'ca', name:'Language.Catalan',  flag: 'catalonia-48-flag-color.svg'   },
  ];

  public appPages = [
    { title: 'List', url: '/list-map/List', icon: 'list' },
    { title: 'Map', url: '/list-map/Map', icon: 'map' },
    { title: 'Config', url: '/config', icon: 'settings' },
    { title: 'Charts', url: '/charts', icon: 'pie-chart' }
  ];
  public labels = ['List-park', 'Map-park' ];
  param4Park = { value: '- vehicle safe' };

  constructor(
    public authService: AuthenticationService,
    private socialSharing: SocialSharing,
    public translate: TranslateService
    ) {
    }

    ngOnInit() {
      this.langValue = 'en';
      // this language will be used as a fallback when a translation isn't found in the current language
      this.translate.setDefaultLang(this.langValue);
      // the lang to use, if the lang isn't available, it will use the current loader to get them
      this.translate.use(this.langValue);
      this.currentFlag = this.languages.filter( elem => elem.key === this.langValue)[0].flag;

    }

    optionsFn(): void { //here item is an object
      // console.log('optionsFn().changeLanguage(\''+this.langValue+'\')');
      this.changeLanguage(this.langValue);
      this.currentFlag = this.languages.filter( elem => elem.key === this.langValue)[0].flag;
    }

    changeLanguage(pLang: string){
      this.translate.use(pLang);
    }

    shareButtonClicked(){
      this.socialSharing.share("Hey! Try the app Park, It's great!", 'App Park', null);
    }
}
