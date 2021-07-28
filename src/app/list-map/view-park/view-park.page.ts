import { Component, Input, OnInit } from '@angular/core';
import { IParking, IParks,IParksWithId,  IPlace, IUserParking, INotifDisponibilidad,  INotifDisponibilidadWithId } from 'src/shared/interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';
import { NavigationService } from 'src/shared/services/navigation.service';
import { GlobalEventsService } from 'src/shared/services/global-events.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { UserService } from 'src/shared/services/user.service';
import { FirestoreParksService } from 'src/shared/services/firestore-parks.service';
import { FirestoreNotifDisponibilidadService } from 'src/shared/services/firestore-notif-disponibilidad.service';

@Component({
  selector: 'app-view-park',
  templateUrl: './view-park.page.html',
  styleUrls: ['./view-park.page.scss'],
})
export class ViewParkPage implements OnInit {
  @Input() parking: IParking;
  @Input() placesRows: IPlace[][] = [[]] ;  //Array of Array of IPlace for ion-grid
  id: any;
  dataQR: string;
  isNewParking = false;
  userParkings: IUserParking[];

  iparks: IParks[] = [];
  idPark: string;

  initialDate = new Date(1900,1,1);
  lastParkingPlaceOfUser: IParksWithId;  //última plaza ocupada/liberada
  idLastParkingPlaceOfUser = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreParkingService: FirestoreParkingService,
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController,
    private navigation: NavigationService,
    private firestoreUserParkingService: FirestoreUserParkingService,
    public firestoreParksService: FirestoreParksService,
    public firestoreNotifDisponibilidadService: FirestoreNotifDisponibilidadService,
    public globalEventsService: GlobalEventsService,
    public userService: UserService
   ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
   }
  /**
    Load the view but wait to load of all parking(this.id) data
  */
  ngOnInit() {
    this.loadData();
    this.checkIfNewParking();
  }

  // callback function to sort 2 places:
  placesSortCriteria = (p1: IPlace, p2: IPlace) => {
    if (p1.coordX < p2.coordX) return -1;  //disordered
    else if (p1.coordX === p2.coordX) {      //see cols
      if (p1.coordY < p2.coordY) return -1;  //disordered
      else if (p1.coordY === p2.coordY) return 0; // equal
            else  return 1 ;                  // ordered
    }
  };

  // copy ordered parking.places to a 2 dimensional placesRows array grid
  copyPlacesToGrid() {
    if (this.parking.places.length > 0) {
      for ( let i=0, nextCol = 0, nextRow = 0, lastCoordX = this.parking.places[0].coordX ;
            i <  this.parking.places.length;
            i++)
      {
        if ( this.parking.places[i].coordX !== lastCoordX ) { // break: continue on next row
            lastCoordX = this.parking.places[i].coordX ;
            nextRow++; this.placesRows[nextRow] = [] ;
            nextCol=0;
          }
          this.placesRows[nextRow][nextCol] = this.parking.places[i];
          nextCol++;
      }
    }
  }

  /**
    Use  firestoreParkingService.getParking(id) that returns a Subscription embedded in a Promise
   */
  async loadData() {
    this.firestoreParkingService.getParking(this.id)
      .subscribe(
        (pparking) => {
          this.parking = pparking as IParking;
          this.parking.places = this.parking.places.sort( this.placesSortCriteria ); // sort every row of places individually
          this.copyPlacesToGrid();
        },
        (err) => { alert('Error caught at subscribe on Firebase url "' + err.url + '" '); },   //2nd subscribe param
        () => {} //Complete
      );

      // aparcamiento del historial (IParks) donde está el usuario aparcado
      //     o el ultimo aparcamiento donde se ha aparcado
      const uid = JSON.parse(localStorage.getItem('user')).uid;
      await this.firestoreParksService.getPlazaDeUsuario(uid).then(
        (plaza) => {  this.idLastParkingPlaceOfUser = plaza.id ; this.lastParkingPlaceOfUser = plaza.aparcamiento;  }
      );
      console.log('idLastParkingPlaceOfUser = '+this.idLastParkingPlaceOfUser);
      console.log('this.lastParkingPlaceOfUser.idUser = '+this.lastParkingPlaceOfUser.idUser);
      console.log('                           .idParking = '+this.lastParkingPlaceOfUser.idParking);
      console.log('                           .coordX = '+this.lastParkingPlaceOfUser.coordX);
      console.log('                           .coordY = '+this.lastParkingPlaceOfUser.coordY);
      console.log('                           .datePark = '+this.lastParkingPlaceOfUser.datePark.toString());
      console.log('                           .dateLeave = '+this.lastParkingPlaceOfUser.dateLeave?.toString());

      this.addPushNotifToUserWaiting('datePark'); //only update the datePark
  }

  //Checks if would be needed to add a new relationship user-parking in case the user scans a barcode
  checkIfNewParking() {
    this.firestoreUserParkingService.getUserParkingsSync().
        subscribe(
          (uparkings) => {
            this.userParkings = uparkings.map(
              (t) => ({
                id: t.payload.doc.id,
                ...t.payload.doc.data() as IUserParking
              })
            ).filter(
              (up) => up.idUser === JSON.parse(localStorage.getItem('user')).uid
            );
            // console.log("userParkings: ", this.userParkings);

            const userParkingsString: string[] = [];
            this.userParkings.forEach(userParking => {
              userParkingsString.push(userParking.idParking);
            });

            //Check if this parking is a new one or not
            if (userParkingsString.indexOf(this.id) < 0) {
              console.log("Parking nuevo");
              this.isNewParking = true;
            }
          });
  }

  /**
   * Scan QR process, automatically opens camera, and catches
   * the scanned code in barcodeData variable
   */
  scanQr() {
    this.dataQR = null;
    this.barcodeScanner.scan().then( barcodeData => {
      this.dataQR = barcodeData.text;

      // Check if valid code
      const placeIndex = this.checkIfScannedQrIsValid();
      if ( placeIndex === -1 ) {
        alert("Non valid code. Please, scan a valid barcode");
        return;
      }
      // placeIndex !== -1
      this.presentAlert('Barcode Scanned','Please confirm', this.dataQR).then( resp => {
        if ( resp === 'cancel' ) return;
        if ( !this.parking.places[placeIndex].occupied ) {  // if  scanned place is not occupied
          //if free, checks if the current user is already parked in any other place
          if ( this.isUserParkedAlready() ) {
            alert("Please, leave your current place before occupying another one");
            return;
          } else {
            this.presentAlert('Barcode Scanned','Please confirm you want to park in '+this.dataQR).then( res => {
              if ( res === 'cancel') return ;
              //Añade un nuevo registro IPark independientemente de si ya había aparcado en esta plaza o no
              const newIpark: IParks = {
                idUser: JSON.parse(localStorage.getItem('user')).uid,
                idParking: this.id,
                coordX: this.dataQR[0],  coordY: this.dataQR[1],
                datePark: new Date(),  dateLeave: this.initialDate
              };
              //add new Park
              this.firestoreParksService.create(newIpark);
              this.invertPlaceStatus(this.dataQR);
              this.firestoreParkingService.update(this.id, this.parking);
              //check if adding a new UserParking is needed
              if ( this.isNewParking )  this.addNewUserParking();
              // Añadir push-notifications
              this.addPushNotifToUserWaiting('datePark'); //only update the datePark
              this.loadData();
            });  // presentAlert
          }
        } else {   // scanned place  occupied
          if ( this.isThisCurrentUserPlace() ) {//desocupar IPark del user
            this.leavePlace();
            // Añadir push-notifications
            this.addPushNotifToUserWaiting('dateLeave'); //only update the dateLeave
            this.loadData();
          } else {
            alert("You cannot park into another users place!");
            return;
          }
        }
      });  //presentAlert
    }).catch(err => {
      console.log('Error On barcodeScanner.scan()', err);
    });
  }

  // Mirar si esta plaza la está esperando otro usuario  para notificárselo
  async addPushNotifToUserWaiting(pdateNameToUpdate: string) {

    // 1. Buscar en INotifDisponibilidad con
    //          INotifDisponibilidad.idParking === this.id
    //                              .coordX    === this.dataQR[0]
    //                              .coordY    === this.dataQR[1]
    let myNotifs: INotifDisponibilidadWithId[] = [] ; const myValue = this.id;
    await this.firestoreNotifDisponibilidadService.getCollectionNotifElemsSync('NotifDisponibilidad','idParking','==',myValue).then(
      (resultSet) =>  {
        if ( resultSet?.length > 0 )  myNotifs = resultSet;
      } ,
      (err) => console.log(err)
    );
    console.log('Previous to Filter: myNotifs.length =  '+myNotifs.length);
    myNotifs = myNotifs.filter( (n) => { return ( n.coordX === this.dataQR[0] &&  n.coordY === this.dataQR[1] );}  );
    console.log('After Filter: myNotifs.length =  '+myNotifs.length);
    // 2. Si encontrado actualizar fechas
    myNotifs.forEach(  elem => {
      if ( pdateNameToUpdate === 'datePark' )
        this.firestoreNotifDisponibilidadService.updateNotifNewDateParkField(elem.id,elem.datePark);
      if ( pdateNameToUpdate === 'dateLeave' )
        this.firestoreNotifDisponibilidadService.updateNotifNewDateLeaveField(elem.id,elem.dateLeave);
      console.log('addPushNotifToUserWaiting:pdateNameToUpdate =  '+pdateNameToUpdate);
      console.log('                         :elem.id =  '+elem.id);
      console.log('                         :datePark =  '+elem.datePark);
      console.log('                         :dateLeave =  '+elem.dateLeave);
    });
  }

  //Leaves the user's place free
  leavePlace() {

    this.firestoreParksService.updateParksDateLeave(new Date(), this.idLastParkingPlaceOfUser);
    this.invertPlaceStatus(this.dataQR);
    this.firestoreParkingService.update(this.id, this.parking);
  }

  //When scanning an occupied place, checks if it belongs to the current user
  isThisCurrentUserPlace(): boolean {
    const row = this.dataQR[0];
    const col = this.dataQR[1];

    if ( this.lastParkingPlaceOfUser.idUser !== '' &&
        this.lastParkingPlaceOfUser.coordX === row && this.lastParkingPlaceOfUser.coordY === col &&
        this.lastParkingPlaceOfUser.idParking === this.id
       )
          return true;
    else  return false;
  }

  /**
   *
   * @returns Checks if the user is already parked in any other place. If he is, returns true
   */
  isUserParkedAlready(): boolean {
    if ( this.lastParkingPlaceOfUser.idUser === '' ) return false; //Had never parked, no elems in IParks
    if ( this.lastParkingPlaceOfUser.dateLeave < this.lastParkingPlaceOfUser.datePark ) return true;
    else return false;
  }

  /**
   *
   * @returns Returns the place index of the scanned place if it exists. If not, returns -1
   */
  checkIfScannedQrIsValid(): number{
    let row: string;
    let col: string;

    if (this.dataQR.length === 2) {
      row = this.dataQR[0];
      col = this.dataQR[1];
    }
    else if (this.dataQR.length === 3) {
      row = this.dataQR[0];
      col = this.dataQR[1] + this.dataQR[2];
      console.log('is three');
    } else {
      return -1;
    }

    for (let i = 0; i < this.parking.places.length; i++) {
      if (this.parking.places[i].coordX === row && this.parking.places[i].coordY === col) {
        return i;
      }
    }
    return -1;
  }

  //Invert the status of a place if the scan process is resolved
  invertPlaceStatus(pdataQR: string){
    const row = pdataQR[0];
    const col = pdataQR[1];

    for (var i = 0, len = this.parking.places.length; i < len; i++) {
      console.log(this.parking.places[i].coordX + this.parking.places[i].coordY);

      if (this.parking.places[i].coordX === row && this.parking.places[i].coordY === col) {
        this.parking.places[i].occupied = !this.parking.places[i].occupied;
        break;
      }
      console.log('invertPlaceStatus: Loop will continue.');
    }
  }

  /**
   * Presents the modal where the user is asked to confirm or cancel
   * when he scans a parking place
   *
   * @param data
   */
  async presentAlert(_header: string, _message: string, data?: string) {
    return new Promise( async (resolve) => {
      const alert = this.alertController.create( {
        header: _header,
        message: _message,
        backdropDismiss: false,
        buttons: [  { text: 'Cancel',  role: 'cancel',  handler: cancel => resolve('cancel')   },
                    { text: 'Confirm', role: 'confirm', handler: confirm => resolve('confirm') }
                 ]
      } );  //alertController.create
      ( await alert ).present();
    });
  }

  //Adds a new UserParking if the scan process is resolved and the relationship between user and park is new
  addNewUserParking() {
    this.isNewParking = false;

    const newUserParking: IUserParking = {
      idParking: this.id,
      idUser: JSON.parse(localStorage.getItem('user')).uid
    };

    this.userService.addParkingOnUser(newUserParking).then(() => {
      console.log("New UserParking added, idParking: " + newUserParking.idParking);
      console.log("New UserParking added, idUser: " + newUserParking.idUser);
    }).catch((err) => {
      console.log(err);
    });
  }

  onBackButtonPressed(){
    this.globalEventsService.publishSomeData();
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    // return mode === 'ios' ? 'Back' : 'Back';
    return 'Back';  //no 'Back' text for the moment
  }

  // [defaultHref]="getBackRoute()"
  getBackRoute(){
    // use the navigationService to get the last route into backRoute
    const backRoute = this.navigation.history[this.navigation.history.length - 2];
    if ( !backRoute )  return '/' ; // only one route in history
    else   return backRoute;
  }

}
