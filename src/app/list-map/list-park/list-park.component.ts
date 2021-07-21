import { Component, Input, OnInit } from '@angular/core';
import { IParking, IUserParking } from 'src/shared/interfaces/interfaces';
import { ParkingService } from 'src/shared/services/parking.service';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { LoadingService } from 'src/shared/services/Loading.service';

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
              private loadingService: LoadingService
              ) {   }

  ngOnInit() {
    this.loadingService.present();       //init spinner
    this.loadData();
    this.loadingService.dismiss();                //stop spinner
  }

  /**
   * Use firestoreParkingService.getParkings() that returns an observable$
   */
  async loadData() {

    let myUPTable: IUserParking[] = [];
    // Retrieve UserParking N:M relationship for the current user this.idUser
    this.idUser = JSON.parse(localStorage.getItem('user')).uid;
    if ( !this.idUser ) return;  //to avoid undefined
    // Get IUserParking elements for this.idUser
    await this.firestoreUserParkingService.getParkingsOfUser(this.idUser)
            .then( (uptable) => myUPTable = uptable );  //then
    // Get only IParking elements for every idUser,idParking
    for (let i = 0 ; i < myUPTable.length ; i++)
      await this.firestoreParkingService.getParkingPromise(myUPTable[i].idParking).then(
        (pparking) => {                                                              //onfulfilled
            const newParking: IParking = pparking as IParking;
            newParking.id = myUPTable[i].idParking;
            this.parkings.push(newParking);
          } ,
       (error) => console.log('ListParkComponent.loadData error : '+error)                     //onrejected
      );

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
