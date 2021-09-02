import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { AlertController } from '@ionic/angular';
import { INotifDisponibilidad, INotifDisponibilidadWithId, IParksWithId, IUser } from '../interfaces/interfaces';
import { FirestoreNotifDisponibilidadService } from './firestore-notif-disponibilidad.service';
import { FirestoreParksService } from './firestore-parks.service';
import { FirestoreUserService } from './firestore-user.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotifService {
  myUserLogin: IUser ;

  initialDate = new Date(1900,1,1);
  lastParkingPlaceOfUser: IParksWithId;  //última plaza ocupada/liberada
  idLastParkingPlaceOfUser = '';

  constructor(
    public firestoreUserService: FirestoreUserService,
    public firestoreParksService: FirestoreParksService,
    public firestoreNotifDisponibilidadService: FirestoreNotifDisponibilidadService,
    private alertController: AlertController,
    public router: Router
  ) { }

  // unregister to push-notifications
  unregisterPushNotif() {
    // Remove all the notifications from the notifications screen
    this.removeAllDeliveredNotifications();   // without then process
    // Remove all listeners
    this.removeAllListeners(); // without then process
  }

  // register to notifDisponibilidad push-notifications
  async registerPushNotif(): Promise<boolean> {
    // begin: register push-notif
    let registered = false;
    console.log('this.myUserLogin.envioDisponibilidad: user.envioDisponibilidad is true');
    await this.register().then(   // Register with Apple / Google to receive push via APNS/FCM
        (result) => { if ( result !== false ) registered = true; } ,
        (err) => console.log('PushNotifService.register : error = ', err)
      );
    if ( registered )  {
      this.addLregistration();
      this.addLregistrationError();
      this.addLpushNotificationReceived();
      this.addLpushNotificationActionPerformed();
    }
    return new Promise( (resolve) => resolve(registered) ) ;
  } // end : register push-notif

  // register to notifications by envioDisponibilidad
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
      await this.registerPushNotif().then( (result) => registered = result );
      if ( !registered ) {  // to have a token for push-notifications
        window.alert('Unable to register to push-notifications');
        return ;
      }
      // alert('registerNotifEnvDisp: YES registerPushNotif');
      // Buscar aparcamiento del historial (IParks) donde está el usuario aparcado
      //     o el ultimo aparcamiento donde se ha aparcado
      await this.firestoreParksService.getPlazaDeUsuario(idUser).then(
        (plaza) => {  this.idLastParkingPlaceOfUser = plaza.id ; this.lastParkingPlaceOfUser = plaza.aparcamiento;  }
      );
      // Buscar la NotifDisponibilidad previa para este user
      let myNotifs: INotifDisponibilidadWithId[] = [] ; const myValue = idUser;
      await this.firestoreNotifDisponibilidadService.getCollectionNotifElemsSync('NotifDisponibilidad','idUser','==',myValue).then(
        (resultSet) =>  {
          if ( resultSet?.length > 0 )  myNotifs = resultSet;
        } ,
        (err) => console.log(err)
      );
      console.log('registerNotifEnvDisp: myNotifs.length =  '+myNotifs.length);
      // Si no existe crearla
      const newNotif: INotifDisponibilidad  = {
        idUser: JSON.parse(localStorage.getItem('user')).uid,
        registrationToken: JSON.parse(localStorage.getItem('tokenPushNotifications')),
        idParking: '', // Ultima plaza que ocupó el usuario
        coordX: '',  //
        coordY: '',
        datePark: this.initialDate,
        dateLeave: this.initialDate,
        notifSendToDevice: true
      } ;
      // casos en que NO hay que actualizar la NotifDisponibilidad
      // 1- si NO Ha aparcado nunca
      if ( this.lastParkingPlaceOfUser.idUser === '' ) { // NO Ha aparcado nunca
        // no hacer nada
      } else {                                // Ha aparcado una vez por lo menos
        newNotif.idParking = this.lastParkingPlaceOfUser.idParking ;
        newNotif.coordX = this.lastParkingPlaceOfUser.coordX ;
        newNotif.coordY = this.lastParkingPlaceOfUser.coordY ;
        newNotif.datePark = this.lastParkingPlaceOfUser.datePark;
        // Si ha dejado la plaza
        if ( this.lastParkingPlaceOfUser.dateLeave > this.lastParkingPlaceOfUser.datePark ) {
          newNotif.dateLeave = this.lastParkingPlaceOfUser.dateLeave;
          newNotif.notifSendToDevice = false;   // para que el node server envíe la notif
        } else { // no ha dejado la plaza
          // conservar la plaza que tenía para que le notifiquen
          if ( myNotifs.length > 0 ) { // debe ser 0  o  1
            newNotif.idParking = myNotifs[0].idParking ;
            newNotif.coordX= myNotifs[0].coordX ;
            newNotif.coordY = myNotifs[0].coordY ;
            newNotif.datePark = myNotifs[0].datePark;
            newNotif.dateLeave = myNotifs[0].dateLeave;
            newNotif.notifSendToDevice = myNotifs[0].notifSendToDevice;   // conservamos estado
          }
          // La plaza y estado de NotifDisponibilidad la cambiará scanQR al dejar la plaza actual este usuario
        }
      } // fsi
      // Actualizar
      if ( myNotifs.length > 0 )   this.firestoreNotifDisponibilidadService.update(myNotifs[0].id, newNotif) ;
      // Crear
      else this.firestoreNotifDisponibilidadService.create(newNotif) ;

    } else {
      // alert('registerNotifEnvDisp:unregisterPushNotif');
      this.unregisterPushNotif();    //this.myUserLogin.envioDisponibilidad = false
    }

  }

  // Registration with a token received from FCM = Firebase Cloud Messaging
  async register(): Promise<any> {
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
    else return new Promise( resolve => resolve(false) );
  }

  // add Listener registration with a token received from FCM = Firebase Cloud Messaging
  addLregistration() {
    PushNotifications.addListener('registration',
       (token: Token) => {
        localStorage.setItem('tokenPushNotifications', JSON.stringify(token.value));
        window.alert('Push registration success, token: ' + token.value);
         console.log(token.value);
         // The token should be in INotifDisponibilidad.registrationToken set on registration process
       }
     );
  }

  // Registration error handler
  addLregistrationError() {
    PushNotifications.addListener('registrationError',
        (error: any) => {
          window.alert('Error on registration: ' + JSON.stringify(error));
        }
     );
  }

  // add Listener pushNotificationReceived handler
  //   called to show the notification payload if the app is open on our device
  addLpushNotificationReceived() {
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // window.alert('Push received: ' + JSON.stringify(notification));
        let myTitle = notification.title ;
        let myBody = notification?.body ;
        const myData = notification?.data ;
        let respButton = '';
        this.presentAlertNotifOk(myTitle,myBody, myData ).then( resp => respButton = resp as string );
      }
    );
  }

  // add Listener pushNotificationActionPerformed
  //  Called when tapping on a notification on status bar on the device  and the app is not in foreground
  addLpushNotificationActionPerformed(){
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // window.alert('Push action performed: ' + JSON.stringify(notification));
        let myData = notification.notification.data;
        let myTitle = 'Plaza '+ myData.coordX + myData.coordY+' en Parking de ' + myData.address+ '\n' ;
        let myBody ='Ocupada el '+ myData.datePark ;
        let respButton = '';
        this.presentAlertNotifOk(myTitle,myBody, myData ).then( resp => respButton = resp as string );
      }
    );
  }

  /**
   * Presents the modal where the user is asked to OK
   * when he receives a push-notification with the app in foreground
   */
   async presentAlertNotifOk(_header: string, _message: string, data?: string) {
    return new Promise( async (resolve) => {
      const alert = this.alertController.create( {
        header: _header,
        message: _message,
        backdropDismiss: false,
        buttons: [  { text: 'Ok',  role: 'confirm',  handler: cancel => resolve('Ok')   } ]
      } );  //alertController.create
      ( await alert ).present();
    });
  }
    /**
   * Presents the modal where the user is asked to Confirm or Cancel
   * when he receives a push-notification with the app in Background
   */
      async presentAlertNotifBackgroud(_header: string, _message: string, data?: string) {
      return new Promise( async (resolve) => {
        const alert = this.alertController.create( {
          header: _header,
          message: _message,
          backdropDismiss: false,
          buttons: [  { text: 'Confirm',  role: 'confirm',  handler: cancel => resolve('Confirm')  },
                      { text: 'Cancel',  role: 'cancel',  handler: cancel => resolve('Cancel')  }
                   ]
        } );  //alertController.create
        ( await alert ).present();
      });
    }

  removeAllDeliveredNotifications(){
    return PushNotifications.removeAllDeliveredNotifications();
  }

  removeAllListeners(){
    return PushNotifications.removeAllListeners();
  }
} // end of PushNotifService
