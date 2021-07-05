import { TestBed } from '@angular/core/testing';

import { FirestoreParkingService } from './firestore-parking.service';

describe('FirestoreParkingService', () => {
  let service: FirestoreParkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreParkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
