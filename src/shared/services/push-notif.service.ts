import { Injectable } from '@angular/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { IUser } from '../interfaces/interfaces';
import { FirestoreUserService } from './firestore-user.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotifService {
  myUserLogin: IUser ;

  constructor(
    public firestoreUserService: FirestoreUserService
  ) { }

  // register to push-notifications for envioDisponibilidad
  async registerNotifEnvDisp() {
    const idUser = JSON.parse(localStorage.getItem('user')).uid;
    await this.firestoreUserService.getUserSync(idUser).then(
      (puser)   => this.myUserLogin = puser as IUser,
      (reject)  => {
        console.log('registerNotifEnvDisp: reject = '+reject);
        return;
      }
    );
    if ( this.myUserLogin.envioDisponibilidad ) {
      let registered = false;
      console.log('this.myUserLogin.envioDisponibilidad: user.envioDisponibilidad is true');
      await this.register().then(   // Register with Apple / Google to receive push via APNS/FCM
          (result) =>  registered = true ,
          (err) => console.log('PushNotifService.register : error = ', err)
        );
      if ( registered )  {
        this.registration();
        this.registrationError();
        this.pushNotificationReceived();
        this.pushNotificationActionPerformed();
      }
    } else {     //this.myUserLogin.envioDisponibilidad = false
      // Remove all the notifications from the notifications screen
      this.removeAllDeliveredNotifications();   // without then process
      // Remove all listeners
      this.removeAllListeners(); // without then process
    }
  }

  async register(): Promise<void> {
    let permission = false;
    // iOS will prompt user and return if they granted permission or not || // Android will just grant without prompting
    await PushNotifications.requestPermissions().then(
      (result) => {
        if (result.receive === 'granted') permission = true;
        else  console.log('PushNotifications.requestPermissions : result.receive = '+result.receive);
      },
      (err) => console.log('PushNotifService : error = ', err)
    );
    if ( permission ) return PushNotifications.register();  //Promise<void>
  }

  // Registration with a token received from FCM
  registration() {
    PushNotifications.addListener('registration',
       (token: Token) => {
         window.alert('Push registration success, token: ' + token.value);
         console.log(token.value);
         // The token should be in INotifDisponibilidad.registrationToken set on registration process
       }
     );
  }

  // Registration error handler
  registrationError() {
    PushNotifications.addListener('registrationError',
        (error: any) => {
          window.alert('Error on registration: ' + JSON.stringify(error));
        }
     );
  }

  // pushNotificationReceived handler to show the notification payload if the app is open on our device
  pushNotificationReceived() {
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        window.alert('Push received: ' + JSON.stringify(notification));
      }
    );
  }

  // Method called when tapping on a notification on status bar and the app is not in foreground
  pushNotificationActionPerformed(){
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        window.alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  removeAllDeliveredNotifications(){
    return PushNotifications.removeAllDeliveredNotifications();
  }

  removeAllListeners(){
    return PushNotifications.removeAllListeners();
  }
} // end of PushNotifService
