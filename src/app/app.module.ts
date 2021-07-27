import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// simulating Http client through In-memory Web API
// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService } from '../shared/services/in-memory-data.service';
// simulating Http client through In-memory Web API

import { LoadingService } from 'src/shared/services/Loading.service';
import { FirestoreUserService } from 'src/shared/services/firestore-user.service';
// Geolocation Plugins
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { AuthenticationService } from 'src/shared/services/authentication.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import { UserService } from 'src/shared/services/user.service';


@NgModule({
  declarations: [AppComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests and returns simulated server responses.
    // Remove it when a real server is ready to receive requests, or use
    // ( environment.production ? HttpClientInMemoryWebApiModule.forRoot(DataService) : [] )
    // in environment files
    // HttpClientInMemoryWebApiModule.forRoot( InMemoryDataService, { dataEncapsulation: false, delay : 500 } ),
    // end of HttpClientInMemoryWebApiModule
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })],
  providers: [ 
    UserService,
    FirestoreUserService,
    LoadingService,
    AuthenticationService,
    Geolocation,
    NativeGeocoder,
    BarcodeScanner,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {
    // // Diagnostic only: inspect router configuration
    // constructor(router: Router) {
    //   // Use a custom replacer to display function names in the route configs
    //   const replacer = (key, value) => (typeof value === 'function') ? value.name : value;

    //   console.log('Routes: ', JSON.stringify(router.config, replacer, 2));
    // }
}
