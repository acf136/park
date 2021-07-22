import { Component, Input, OnInit } from '@angular/core';
import { IParking, IUserParking } from 'src/shared/interfaces/interfaces';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { FirestoreUserParkingService } from 'src/shared/services/firestore-user-parking.service';
import { LoadingService } from 'src/shared/services/Loading.service';
import { GlobalEventsService } from 'src/shared/services/global-events.service';

@Component({
  selector: 'app-list-park',
  templateUrl: './list-park.component.html',
  styleUrls: ['./list-park.component.scss'],
})

export class ListParkComponent implements OnInit {
  @Input() parking: IParking;
  public parkings: IParking[] = [];
  public uParkingWithFirebaseId: any;
  private idUser = '';


  constructor(
              private firestoreParkingService: FirestoreParkingService,
              private firestoreUserParkingService: FirestoreUserParkingService,
              private globalEventsService: GlobalEventsService,
              private loadingService: LoadingService
              ) {
<<<<<<< HEAD
                // this.idUser = JSON.parse(localStorage.getItem('user'))?.uid;
                // console.log('ListParkComponent.constructor this.idUser= '+ this.idUser);
=======
                this.idUser = JSON.parse(localStorage.getItem('user'))?.uid;
                console.log('this.idUser '+ this.idUser);
>>>>>>> 5ac2544c5b97ff92f74d17964a69d48b25d4aac4

                this.globalEventsService.getObservable().subscribe( (data) => {
                  this.parkings = [];
                  this.loadData();
                });
              }

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
    this.uParkingWithFirebaseId = myUPTable;
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
      // this.firestoreParkingService.delete(pid);
      const index1: number = this.parkings.findIndex(uparkings => uparkings.id === pid);
      if (index1 !== -1) {
          //this.myUPTable.splice(index, 1);
          this.parkings.splice(index1, 1);
      }

      const index2: number = this.uParkingWithFirebaseId.findIndex(uparkings => uparkings.idParking === pid);
      if (index2 !== -1) {
        //this.myUPTable.splice(index, 1);
        this.firestoreUserParkingService.delete(this.uParkingWithFirebaseId[index2].id);
      }
    }
  }

  isIos() {
    const win = window as any;
    return win && win.Ionic && win.Ionic.mode === 'ios';
  }

}
