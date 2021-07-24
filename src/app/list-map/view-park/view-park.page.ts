import { Component, Input, OnInit } from '@angular/core';
import { IParking, IParks, IPlace, IUserParking } from 'src/shared/interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController, ModalController, NumericValueAccessor } from '@ionic/angular';
import { NavigationService } from 'src/shared/services/navigation.service';
import { GlobalEventsService } from 'src/shared/services/global-events.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { UserService } from 'src/shared/services/user.service';
import { FirestoreParksService } from 'src/shared/services/firestore-parks.service';

@Component({
  selector: 'app-view-park',
  templateUrl: './view-park.page.html',
  styleUrls: ['./view-park.page.scss'],
})
export class ViewParkPage implements OnInit {
  @Input() parking: IParking;
  @Input() placesRows: IPlace[][] = [[]] ;  //Array of Array of IPlace for ion-grid
  id: any;
  data: any;
  isNewParking: Boolean = false;
  userParkings: IUserParking[];

  iparks: IParks[] = [];
  idPark: string;
  iParksWithFirebaseId: any;
  IdParkToRemoveDateLeave: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreParkingService: FirestoreParkingService,
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController,
    private modalController: ModalController,
    private navigation: NavigationService,
    private firestoreUserParkingService: FirestoreUserParkingService,
    public firestoreParkService: FirestoreParksService,
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

  // getParksId(){
  //   this.firestoreParkService.getParks().subscribe(iparks => {
  //     iparks.forEach(park => {  
  //       this.iparks = park.map(
  //       (t) => ( { id: t.payload.doc.id,  ...t.payload.doc.data() as IUserParking } )
  //       );
  //       resolve( this.myUserParkings );
  //       if ( puserParkings.length <= 0 ) reject('puserParkings empty');
  //     },
  //     err => { alert('getUserParkings : subscribe => Error: ' + err); 
  //     });
        
  //     //   {
  //     //   if (park.idUser == JSON.parse(localStorage.getItem('user')).uid) 
  //     //   {
  //     //     this.iparks = park.data();
  //     //     result = true;
  //     //   }   
  //     // });
  //   },(err) => { 
  //     alert('Error caught at subscribe on Firebase url "' + err.url + '" ');
  //     console.log("Error getting document:", err);
  //   },
  //   () => {
  //     if (!result) {
  //       observer.next(false);
  //       observer.complete();
  //     }
  //   });
  // }

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
          // sort every row of places individually
          this.parking.places = this.parking.places.sort( this.placesSortCriteria );
          // console.log('ParkingView.idParking = ', this.parking.idParking );
          // this.parking.places.forEach( item => console.log('X=',item.coordX,'Y=',item.coordY));
          this.copyPlacesToGrid();

          console.log("parking: ", this.parking);
          console.log("places: ", this.parking.places);

        },
        (err) => { alert('Error caught at subscribe on Firebase url "' + err.url + '" '); },   //2nd subscribe param
        () => {} //Complete
      );

      let iPTable: IParks[] = [];
      await this.firestoreParkService.getParksOfUser(JSON.parse(localStorage.getItem('user')).uid)
            .then( (iparks) => iPTable = iparks );
      //this.getParksId();
      this.iParksWithFirebaseId = iPTable;

      for (let i = 0 ; i < iPTable.length ; i++)
      await this.firestoreParkService.getParksPromise().then(
        (ppark) => {                                                              //onfulfilled
            const iPark: IParks = ppark as IParks;
            //iPark.id = iPTable[i].idParking;
            this.iparks.push(iPark);
          } ,
       (error) => console.log('ListParkComponent.loadData error : '+error)                     //onrejected
      );

      this.iparks.forEach(element => {
        console.log(element);
      });
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
            console.log("userParkings: ", this.userParkings);

            let userParkingsString: String[] = [];
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
  ScanQr() {
    this.data = null;
    //this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', "B2");
      this.data = "C2";
      
      // Check if valid code
      const placeIndex = this.checkIfScannedQrIsValid();
      if(placeIndex > 0){
        //check user answer
        this.presentAlert('Barcode Scanned','Please confirm', this.data) .then(res => {
          if (res == 'confirm') {
            //check if the scanned place is free or not
            if (!this.parking.places[placeIndex].occupied) {
              //if free, checks if the current user is already parked in any parking
              //this.isUserParkedAlready().subscribe(yes => {
                
              if (this.isUserParkedAlready()) {
                alert("Please, leave your current place before occupying another one");
                return;
              } 
              else 
              {
                this.presentAlert('Barcode Scanned','Please confirm you want to park in ' + this.data).then(response => {
                  if (response) {
                    //check if the user has parked before in this place to update it and not creating a new IPark
                    //so, if this iPark has the dateLeave attribute, it has to be deleted
                    if (!this.checkIfNewIPark()) {
                      //Eliminar el campo dateLeave
                      this.firestoreParkService.updateParkRemoveDateLeaveField(this.IdParkToRemoveDateLeave);
                    } else {
                      //user aparca
                      let newIpark: IParks = {
                        idUser: JSON.parse(localStorage.getItem('user')).uid,
                        idParking: this.id,
                        coordX: this.data[0],
                        coordY: this.data[1],
                        datePark: new Date()
                      };  
                      //add new Park
                      this.firestoreParkService.create(newIpark);
                    }
                    this.invertPlaceStatus(this.data);
                    this.firestoreParkingService.update(this.id, this.parking);
                    //check if adding a new UserParking is needed (??????)
                    if (this.isNewParking) {
                      this.addNewUserParking();
                    }
                    this.loadData();
                  }else{
                    return;
                  }
                });
              }
              //}, 
              //error => { 
                //alert(error);
              //});
            }else{
              //this.isActualUserPlace().subscribe(yes => {
                if (this.isThisCurrentUserPlace()) 
                {
                  //desocupar IPark del user
                  this.leavePlace();
                  this.loadData();
                }else{
                  alert("You cannot park into another users place!");
                  return;
                }
              //}, 
              //error => { 
                
              //});
            }
          }else{
              //cancelado por el usuario
             return;
          }
        });

      }else{
        console.log("Non valid code. Please, scan a 2 digits barcode");
        return;
      }

    //}).catch(err => {
      //console.log('Error', err);
    //});
  }

  checkIfNewIPark(){
    const row = this.data[0];
    const col = this.data[1];

    for (let index = 0; index < this.iParksWithFirebaseId.length; index++) {
      const park = this.iParksWithFirebaseId[index];
      if (park.coordX == row && park.coordY == col && park.idParking == this.id) {
        if (this.hasOwnProperty(park, "dateLeave")) {
          this.IdParkToRemoveDateLeave = park.id;
          return false;
        }
      }
    }
    return true;
  }

  leavePlace() {
    const row = this.data[0];
    const col = this.data[1];

    for (let index = 0; index < this.iParksWithFirebaseId.length; index++) {
      const park = this.iParksWithFirebaseId[index];
      if (park.coordX == row && park.coordY == col && park.idParking == this.id) {
        const firestoreParkId = park.id;
        this.firestoreParkService.updateParkAddDateLeaveField(new Date(), firestoreParkId);
        this.invertPlaceStatus(this.data);
        this.firestoreParkingService.update(this.id, this.parking);
        break;
      }
    }
  }

  hasOwnProperty(obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
  }

  isThisCurrentUserPlace(): Boolean {
    const row = this.data[0];
    const col = this.data[1];

    for (let index = 0; index < this.iParksWithFirebaseId.length; index++) {
      const park = this.iParksWithFirebaseId[index];
      if (park.coordX  == row && park.coordY == col && park.idParking == this.id) {
        if (!this.hasOwnProperty(park, "dateLeave")) {
          return true;
        }
      }
    }

    return false;

    // return new Observable(observer => {
    //   let result = false;
    //   const row = this.data[0];
    //   const col = this.data[1];

    //   this.firestoreParkService.getParks().subscribe(iparks => {

    //     this.iparks.forEach(element => {
    //       console.log(element);
    //     });
        
    //     iparks.docs.forEach(park => {
    //       if (park.data().idUser == JSON.parse(localStorage.getItem('user')).uid && park.data().idParking == this.id) 
    //       {
    //         if (park.data().coordX == row && park.data().coordY == col) 
    //         {
    //           result = true;
    //           observer.next(true);
    //           observer.complete();
    //         }
    //       }   
    //     });
    //   },(err) => { 
    //     alert('Error caught at subscribe on Firebase url "' + err.url + '" ');
    //     console.log("Error getting document:", err);
    //   },
    //   () => {
    //     if (!result) {
    //       observer.next(false);
    //       observer.complete();
    //     }
    //   });
    // });
  }

  /**
   * 
   * @returns Checks if the user is already parked in any other place. If he is, returns true
   */
  isUserParkedAlready(): Boolean {

    for (let index = 0; index < this.iParksWithFirebaseId.length; index++) {
      const park = this.iParksWithFirebaseId[index];
      if (!this.hasOwnProperty(park, "dateLeave")) {
        this.idPark = park.id;
        return true;
      }
    }

    return false;

    // return new Observable(observer => { 
    //   let result = false;
    //   this.firestoreParkService.getParks().subscribe(iparks => {
    //     iparks.docs.forEach(park => {
    //       if (park.data().idUser == JSON.parse(localStorage.getItem('user')).uid) {
    //         result = true;
    //         observer.next(true);
    //         observer.complete();
    //       }   
    //     });
    //   },(err) => { 
    //     alert('Error caught at subscribe on Firebase url "' + err.url + '" ');
    //       observer.error(err);
    //       observer.complete();
    //       console.log("Error getting document:", err);
    //   },
    //   () => {
    //     if (!result) {
    //       observer.next(false);
    //       observer.complete();
    //     }
    //   });
    // });
  }

  /**
   * 
   * @returns Returns the place index of the scanned place if it exists. If not, returns -1
   */
  checkIfScannedQrIsValid(): number{
    const row = this.data[0];
    const col = this.data[1];

    for (var i = 0, len = this.parking.places.length; i < len; i++) {
      console.log(this.parking.places[i].coordX + this.parking.places[i].coordY);

      if (this.parking.places[i].coordX === row && this.parking.places[i].coordY === col) {
        console.log("Place found!");
        //return this.parking.places[i];
        return i;
      }
      //Loop will continue
    }
    return -1;
  }

  invertPlaceStatus(data: string){
    const row = data[0];
    const col = data[1];

    for (var i = 0, len = this.parking.places.length; i < len; i++) {
      console.log(this.parking.places[i].coordX + this.parking.places[i].coordY);

      if (this.parking.places[i].coordX === row && this.parking.places[i].coordY === col) {
        //console.log("Occupied BEFORE: " + this.parking.places[i].occupied);
        this.parking.places[i].occupied = !this.parking.places[i].occupied;
        //console.log("Occupied AFTER: " + this.parking.places[i].occupied);
        break;
      }
      console.log('Loop will continue.');
    }
  }

  /**
   * Presents the modal where the user is asked to confirm or cancel
   * when he scans a parking place
   *
   * @param data
   */
  async presentAlert(_header: string, _message: string, data?: string) {
    return new Promise(async (resolve) => {
      const alert = this.alertController.create({
        header: _header,
        message: _message,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: (cancel) => {
              resolve('cancel');
            }
          }, {
            text: 'Confirm',
            role: 'confirm',
            handler: (confirm) => {
              resolve('confirm');
            }
          }
        ]
      });

      (await alert).present();
    });

  }

  addNewUserParking() {
    let newUserParking: IUserParking;
    this.isNewParking = false;

    newUserParking = {
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

export interface IParksWithId{
  id: string,
  idUser: string;     // emailnuevo@ggg.com
  idParking: string;  // Pl.Catalunya
  coordX: string;  //C
  coordY: string;  //1
  datePark: Date;     // Last date of parking in a place , p.e. 20212508 12:37
  dateLeave?: Date;    // Last date the user leave the place, p.e 0000000 0000
}
