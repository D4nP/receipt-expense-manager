import { Injectable } from '@angular/core';

import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private toast: ToastController) { }

  async showToast(msg) {
    let toast = await this.toast.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
