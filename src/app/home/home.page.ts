import { Component } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { DbService } from '../shared/services/db.service';
import { GlobalService } from '../shared/services/global.service';
import { File } from '@ionic-native/file/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public receiptData: any = [];
  public totalAmount: any = 0;

  constructor(public route: Router, public dbService: DbService,
    public global: GlobalService, private file: File,
    private webview: WebView, private photoViewer: PhotoViewer, private alert: AlertController) {}

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.dbService.dbState().subscribe((res) => {
      if(res){
        this.dbService.fetchReceiptDetails().subscribe(item => {
          this.receiptData = item.reverse();
          this.totalAmount = 0;
          this.manageTotal(item);
        })
      }
    });
  }

  manageTotal(item){
    for(let amount of item) {
      this.totalAmount += parseFloat(amount.claimed_amount)
    }
  }

  getImage(fileName) {
    let newBaseFilesystemPath = this.file.dataDirectory;
    let storedPhoto = newBaseFilesystemPath + fileName;
    return this.webview.convertFileSrc(storedPhoto);
  }

  async imageView(fileName) {
    let newBaseFilesystemPath = this.file.dataDirectory;
    let storedPhoto = newBaseFilesystemPath + fileName;
    await this.photoViewer.show(storedPhoto, fileName, {share: false});
  }

  goToAddReceiptPage() {
    this.route.navigate(['/add-receipt']);
  }

  getTime(time) {
    return moment(parseInt(time)).format('DD/MM/YYYY hh:mm');
  }

  async removeReceiptAlert(id) {
    const alert = await this.alert.create({
      header: 'Confirm!',
      message: 'Are you sure want to delete ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.removeReceipt(id);
          }
        }
      ]
    });
    await alert.present();
  }

  removeReceipt(id) {
    this.dbService.deleteReceiptData(id).then((res) => {
      this.global.showToast("Receipt deleted successfully!");
    },(error) => {
      console.log("error", error);
      this.global.showToast("Something went wrong please try leter!");
    })
  }

}
