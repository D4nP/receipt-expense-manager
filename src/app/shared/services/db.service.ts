import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private storage: SQLiteObject;
  ReceiptDetailsList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
  ) { 
    this.platform.ready().then(() => {
      this.createDatabase();
    })
  }
  createDatabase() {
    this.sqlite.create({
      name: 'receipt_expense_manager.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.storage = db;
      this.createTable();
    }, (error) => {
      console.log("ERROR: ", error);
    });
  }

  dbState() {
    return this.isDbReady.asObservable();
  }

  fetchReceiptDetails(): Observable<any> {
    return this.ReceiptDetailsList.asObservable();
  }

  createTable() {
    this.storage.executeSql(`CREATE TABLE IF NOT EXISTS receipt_detail (id INTEGER PRIMARY KEY, claimed_amount varchar(255), receipt_image varchar(255), image_timeStamp varchar(255), receipt_name varchar(255))`, []).then((res) => {
      this.getReceiptData();
      this.isDbReady.next(true);
    }).catch(e => {
      console.log("error " + JSON.stringify(e))
    });
  }

  getReceiptData() {
    return this.storage.executeSql('SELECT * FROM receipt_detail', []).then(res => {
      let items: any[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({ 
            id: res.rows.item(i).id,
            claimed_amount: res.rows.item(i).claimed_amount,  
            receipt_image: res.rows.item(i).receipt_image,
            image_timeStamp: res.rows.item(i).image_timeStamp,
            receipt_name: res.rows.item(i).receipt_name
          });
        }
      }
      this.ReceiptDetailsList.next(items);
    });
  }

  addReceipt(claimed_amount, receipt_image, image_timeStamp, receipt_name) {
    let data = [claimed_amount, receipt_image, image_timeStamp, receipt_name];
    return this.storage.executeSql('INSERT INTO receipt_detail (claimed_amount, receipt_image, image_timeStamp, receipt_name) VALUES (?, ?, ?, ?)', data)
    .then(res => {
      this.getReceiptData();
    });
  }

  deleteReceiptData(id) {
    return this.storage.executeSql('DELETE FROM receipt_detail WHERE id = ?', [id])
    .then(res => {
      this.getReceiptData();
    });
  }
}
