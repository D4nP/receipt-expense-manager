import { Component, OnInit } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Router } from '@angular/router';

import { GlobalService } from '../shared/services/global.service';
import { DbService } from '../shared/services/db.service';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-add-receipt',
  templateUrl: './add-receipt.page.html',
  styleUrls: ['./add-receipt.page.scss'],
})
export class AddReceiptPage implements OnInit {

  public claimedAmount: any;
  public Data: any;
  public imageCaptureTime: any;
  public imageUrl: any;
  public imageName: any;
  public receiptName: any;

  constructor(private camera: Camera, private db: DbService, 
    private webview: WebView, private route: Router, 
    public global: GlobalService, private file: File) { }

  ngOnInit() {
  }

  removeimage() {
    this.imageCaptureTime = null;
    this.imageUrl = null;
    this.imageName = null;
  }

  takePicture() {
    const options: CameraOptions = {
			quality: 100,
			targetWidth: 1000,
			targetHeight: 1000,
			allowEdit: false,
			sourceType: this.camera.PictureSourceType.CAMERA,
			destinationType: this.camera.DestinationType.FILE_URI,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			saveToPhotoAlbum: true
		}
    this.camera.getPicture(options).then((imageData) => {
      this.imageUrl = this.webview.convertFileSrc(imageData);
      this.imageName = imageData.split("/").pop();
      let path = imageData.substring(0,imageData.lastIndexOf('/')+1);
      this.imageCaptureTime = new Date().getTime();
      this.storeInDeviceImage(path, this.imageName);
		}, (err) => {
			console.log("error", err);
		});
  }

  async storeInDeviceImage(tempBaseFilesystemPath, tempFilename) {
    const newBaseFilesystemPath = this.file.dataDirectory;
    await this.file.copyFile(tempBaseFilesystemPath, tempFilename, 
      newBaseFilesystemPath, tempFilename);
    // const storedPhoto = newBaseFilesystemPath + tempFilename;
    // console.log("storedphoto", storedPhoto);
  }

  save() {
    if(!this.imageUrl) {
      this.global.showToast("Please capture receipt image!");
      return;
    }

    if(!this.receiptName) {
      this.global.showToast("Receipt name cannot be blank!");
      return;
    }

    if(this.receiptName.trim() == "") {
      this.global.showToast("Receipt name cannot be blank!");
      return;
    }

    if(!this.claimedAmount) {
      this.global.showToast("Please enter claimed amount!");
      return;
    }

    this.db.addReceipt(this.claimedAmount, this.imageName, this.imageCaptureTime, this.receiptName).then(async(res) => {
      this.removeimage();
      this.claimedAmount = null;
      this.receiptName = null;
      this.global.showToast("Receipt added successfully!");
      this.route.navigate(['/home']);
    },(error) => {
      console.log("error: add:::", error);
      this.global.showToast("Something went wrong please try leter!");
    });

  }

}
