import { Component, Input, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  @Input() langValue: string ;
  currentFlag: string;
  flagLocation = '..\\assets\\flags\\';
  // languages to translate -AT LEAST 'en' must be present
  languages: { key: string ; name: string ; flag: string}[] = [
    { key: 'en', name:'Language.English',  flag: 'great-britain-48-flag-color.svg'   },
    { key: 'es', name:'Language.Spanish',  flag: 'spain-48-flag-color.svg'   },
    { key: 'ca', name:'Language.Catalan',  flag: 'catalonia-48-flag-color.svg'   },
  ];
  languagesTranslated: string[] = [] ;

  public appPages = [
    { title: 'List', url: '/list-map/List', icon: 'list' },
    { title: 'Map', url: '/list-map/Map', icon: 'map' },
    { title: 'Leaflet', url: '/list-map/Leaflet', icon: 'map' },
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
      // get the languages to translate from languages[]
      this.languages.forEach( (e) => this.languagesTranslated.push(e.key) );
      this.translate.addLangs( this.languagesTranslated );
      const listOfLangs = this.translate.getLangs();
      // Set the default language by browser
      const brwLang = this.translate.getBrowserLang();
      if ( brwLang  && listOfLangs.lastIndexOf(brwLang) !== -1 )  this.langValue = brwLang;
      // if the browser language is not one of the translated choose the first of them
      if ( !this.langValue )
        if ( !this.translate.currentLang  )
              this.langValue = this.languagesTranslated[0];
        else  this.langValue = this.translate.currentLang;
      // this language will be used as a fallback when a translation isn't found in the current language
      if ( this.langValue ) {
        this.translate.setDefaultLang( this.langValue );
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use( this.langValue );
        this.translate.onLangChange.subscribe( // change flag
          (event: LangChangeEvent) => this.currentFlag = this.languages.filter( elem => elem.key ===  event.lang )[0].flag
        );
      }

    }

    // called when (ionChange) in <ion-select> tag : selection of language
    optionsFn(): void {
      this.changeLanguage(this.langValue);
    }

    changeLanguage(pLang: string){
      this.translate.use(pLang);
    }

    shareButtonClicked(){
      this.socialSharing.share("Hey! Try the app Park, It's great!", 'App Park', null);
    }
}
