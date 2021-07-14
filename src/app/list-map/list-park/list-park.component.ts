import { Component, Input, OnInit } from '@angular/core';
import { IParking, IUserParking } from 'src/shared/interfaces/interfaces';
import { ParkingService } from 'src/shared/services/parking.service';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';

@Component({
  selector: 'app-list-park',
  templateUrl: './list-park.component.html',
  styleUrls: ['./list-park.component.scss'],
})

export class ListParkComponent implements OnInit {
  @Input() parking: IParking;
  public parkings: IParking[] = [];
  private idUser = '';

  constructor(private parkingService: ParkingService,
              private firestoreParkingService: FirestoreParkingService,
              private firestoreUserParkingService: FirestoreUserParkingService,
              private authService: AuthenticationService
              ) {
                this.idUser = this.authService.getUserData().uid;
                console.log('this.idUser '+ this.idUser);
              }

  ngOnInit() {
    // this.loadData();
  }

  /**
   * Use firestoreParkingService.getParkings() that returns an observable$
   */
  async loadData() {
    let myUPTable: IUserParking[] = [];
    // using httpclient
    //
    // this.parkingService.getParkings()
    //   .subscribe(
    //     pparkings =>  this.parkings = pparkings ,
    //     err => { alert('Error caught at Subscriber on url "' + err.url + '" in ' + this.parkingService.getParkings.name ); },
    //     () => console.log('Processing '+ this.parkingService.getParkings.name +' Complete.')
    //   );
    //
// Get all Parkings - DON'T DELETE WHILE developing
// this.firestoreParkingService.getParkings().subscribe(
//     (pparkings) =>  { this.parkings = pparkings.map( (t) => ({                           //1st subscribe param
//                     id: t.payload.doc.id,  ...t.payload.doc.data() as IParking ,
//                   }) ) },
//     err => { alert('Error caught at subscribe on Firebase url "' + err.url + '" '); } ,  //2nd subscribe param
//     () => console.log('Parkings = ', this.parkings)                                      //3rd subscribe param
// );
// Get all Parkings - DON'T DELETE WHILE developing
    //
    // Retrieve UserParking N:M relationship for the current user this.idUser
    this.idUser = this.authService.getUserData().uid;
    if ( !this.idUser ) {
      const userData = JSON.parse(localStorage.getItem('user')) ;
      if ( userData ) this.idUser = userData.uid;
    }
    // this.idUser = 'l4biVd2tDRNDWDTkJWA03bRPLOH3' ; // idUser de prueba
    console.log('list-park -> idUser: '+ this.idUser);
    if ( !this.idUser ) return;  //to avoid undefined
    // Get IUserParking elements for this.idUser
    await this.firestoreUserParkingService.getParkingsOfUser(this.idUser)
            .then( (uptable) => myUPTable = uptable );  //then
    // Get only IParking elements for every idUser,idParking
    for (let i = 0 ; i < myUPTable.length ; i++)
      await this.firestoreParkingService.getParkingPromise(myUPTable[i].idParking)
              .then(
                (pparking) => this.parkings.push(pparking as IParking),                   //onfulfilledO
                (error) => console.log('getParkingPromise error :'+error)                 //onrejected
              );

    console.log('this.parkings  = '+this.parkings);
  }  // end of loadData

  parkingList() {
    this.firestoreParkingService.getParkings().subscribe((data) => {
      console.log(data);
    });
  }

  remove(pidParking,pid) {
    console.log('pid= '+ pid + ' parkingId =' + pidParking);
    if (window.confirm('Are you sure to delete element with id = '+pid+' (idParking='+pidParking+ ') ?')) {
      this.firestoreParkingService.delete(pid);
    }
  }

  isIos() {
    const win = window as any;
    return win && win.Ionic && win.Ionic.mode === 'ios';
  }

}
