import { TestBed } from '@angular/core/testing';

import { FirestoreParksService } from './firestore-parks.service';

describe('FirestoreParksService', () => {
  let service: FirestoreParksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreParksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
