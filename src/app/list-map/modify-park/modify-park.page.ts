import { Component, Input, OnInit } from '@angular/core';
import { IParking, IPlace } from 'src/shared/interfaces/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { FirestoreParkingService } from 'src/shared/services/firestore-parking.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modify-park',
  templateUrl: './modify-park.page.html',
  styleUrls: ['./modify-park.page.scss'],
})
export class ModifyParkPage implements OnInit {
  @Input() parking: IParking;
  @Input() placesRows: IPlace[][] = [[]] ;  //Array of Array of IPlace for ion-grid
  id: any;
  public duplicateForm: FormGroup;
  public modifyForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private firestoreParkingService: FirestoreParkingService,
    public formBuilder: FormBuilder
   ) {
      this.id = this.activatedRoute.snapshot.paramMap.get('id');
      this.duplicateForm = this.formBuilder.group({
          rows      : [ 0 ],
          cols      : [ 0 ],
          idParking : [ 0 ]
      });
      this.modifyForm = this.formBuilder.group({
        idParking : [ '' ],
        name      : [ '' ],
        address   : [ '' ],
        lat       : [ 0 ],
        long      : [ 0 ],
        zipCode   : [ '' ]
    });
   }  // end of constructor

   /**
    *
    * @param pdata : IParking
    */
   fillModifyForm(pdata: IParking) {
    this.modifyForm = this.formBuilder.group({
      idParking : [ pdata.idParking],
      name      : [ pdata.name ],
      address   : [ pdata.address ],
      lat       : [ pdata.lat ],
      long      : [ pdata.long ],
      zipCode   : [ pdata.zipCode ]
    });
  }

  /**
  *
  */
  fillDuplicateForm(pdata: IPlace[][]) {
    const rows = pdata.length; //array of rows
    let cols = 0;
    if ( rows > 0) for (let i=0; i < rows; i++)  if (cols < pdata[i].length)  cols = pdata[i].length  ;
    this.duplicateForm = this.formBuilder.group({
      rows      : [ rows ],
      cols      : [ cols ],
      idParking : [ this.parking.idParking ]
    });
  }

  /**
   * Get 1st level parking attributes from Form
   */
  extractModifyForm(){
    // this.parking = this.modifyForm.value;
    this.parking.name = this.modifyForm.value.name ;
    this.parking.address = this.modifyForm.value.address ;
    this.parking.lat = this.modifyForm.value.lat ;
    this.parking.long = this.modifyForm.value.long ;
    this.parking.zipCode = this.modifyForm.value.name ;
  }

  /**
    Load the view but wait to load of all parking(this.id) data
  */
  ngOnInit() {
    this.loadData();
  }
  /**
    Use  firestoreParkingService.getParking(id) that returns a Subscription embedded in a Promise
   */
  loadData() {
    this.firestoreParkingService.getParking(this.id)
      .subscribe(
        (pparking) => {
          this.parking = pparking as IParking;
          // // sort every row of places individually
          this.parking.places = this.parking.places.sort( this.placesSortCriteria );
          // this.parking.places.forEach( item => console.log('X=',item.coordX,'Y=',item.coordY));
          this.copyPlacesToGrid();
          this.fillModifyForm(this.parking);
          this.fillDuplicateForm(this.placesRows) ;
        },
        (err) => { alert('Error caught at subscribe on Firebase url "' + err.url + '" '); },   //2nd subscribe param
        () => {} //Complete
      );
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
   *  Modify the data in Firestore
   */
  onSubmitModify() {
    this.extractModifyForm(); // get modifications in this.parking
    this.firestoreParkingService.update(this.id, this.parking);
  }

  /**
   *  Duplicatte the data in Firestore
   */
   onSubmitDuplicate() {
    this.extractModifyForm(); // get modifications in this.parking 1st level collection fields
    const newRows = this.duplicateForm.controls.rows.value;
    const newCols = this.duplicateForm.controls.cols.value;
    const newIdParking = this.duplicateForm.controls.idParking.value;
    // ask to generate a new grid  (newRows by newCols) (i.e.  row=coordX='A', col=coordY='3')
    if ( window.confirm('Are you sure to create new parking with idParking= '+newIdParking+ ') ?') ) {
      // Extend current grid to newRows X newCols into a newPlacesRows
      const newPlacesRows = this.placesRows;
      for (let irow = 0; irow < newRows ; irow++) {
        if ( irow > newPlacesRows.length - 1 )
          newPlacesRows[irow] = [ {
            coordX       :  String.fromCharCode('A'.charCodeAt(0) + irow),
            coordY       :  '1',
            occupied     :  false,
            outOfService :  false,
            size         :  1
          } ] ; //create new Row, Col 1
        for (let icol = newPlacesRows[irow].length - 1; icol < newCols ; icol++) {
          if ( irow > newPlacesRows.length - 1 || icol > newPlacesRows[irow].length - 1 ) {
            newPlacesRows[irow][icol] = {
              coordX       :  String.fromCharCode('A'.charCodeAt(0) + irow),
              coordY       :  (icol + 1).toString(),
              occupied     : ( (icol % 2) === 0 ),
              outOfService :  false,
              size         :  2
            }; // create new Col into current Row
          }
        }
      }
      // transfer newPlacesRows to this.parking.places
      for (let irow = 0; irow < newRows ; irow++) {
        for (let icol = 0; icol < newCols ; icol++) {
          this.parking.places[irow * newCols + icol] = {
            coordX       :  newPlacesRows[irow][icol].coordX,
            coordY       :  newPlacesRows[irow][icol].coordY,
            occupied     :  newPlacesRows[irow][icol].occupied,
            outOfService :  newPlacesRows[irow][icol].outOfService,
            size         :  newPlacesRows[irow][icol].size
          };;
        }
      }
      this.firestoreParkingService.create(
        {
          idParking : newIdParking ,
          id        : this.parking.id,
          name      : this.parking.name,
          address   : this.parking.address,
          lat       : this.parking.lat,
          long      : this.parking.long,
          zipCode   : this.parking.zipCode,
          capacity  : this.parking.capacity,
          places    : this.parking.places
        }
        ) //:Promise<DocumentReference<unknown>>
        .then(
          (p) => console.log('returned: '+p) ,                           //onfulfilled
          (error) => console.log('error: '+error)                         //onrejected
        ).catch( (err) => console.log(err) );
    }
  }

}
