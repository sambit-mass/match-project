import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class AclService implements OnDestroy {
  private allIdAccess: boolean[] = [];
  private subscriptions: Subscription[] = [];
  private accessControls: IMainMenu[] = [];

  constructor(private _common: CommonService) {
    this.subscriptions.push(
      this._common.accessControls$.subscribe(data => {
        if (data) {
          this.accessControls = data;
        }
      })
    );
    // Message broadcast channel
    this._common.aclBroadcastChannel.onmessage = event => {
      const data = event.data;
      if (data) {
        this._common.setAccessControls(data, false);
      }
    };
  }

  public hasAccess(arg: {
    moduleId?: string | number;
    actionId?: string | number;
    actionIds?: string[] | number[];
    submoduleId?: string | number;
  }): boolean {
    let checkModule;
    if (arg.moduleId) {
      for (let i = 0; i < this.accessControls.length; i++) {
        if (this.accessControls[i].main_menu_id == arg.moduleId) {
          checkModule = this.accessControls[i];
          break;
        }
      }
    } else if (arg.submoduleId) {
      for (let i = 0; i < this.accessControls.length; i++) {
        if (this.accessControls[i].sub_menu.length) {
          for (let j = 0; j < this.accessControls[i].sub_menu.length; j++) {
            if (this.accessControls[i].sub_menu[j].sub_menu_id == arg.submoduleId) {
              checkModule = this.accessControls[i].sub_menu[j];
              break;
            }
          }
        } else {
          for (let k = 0; k < this.accessControls[i].action.length; k++) {
            if (this.accessControls[i].action[k].action_id == arg.submoduleId) {
              checkModule = this.accessControls[i].action[k];
              break;
            }
          }
        }
      }
    } else if (arg.actionIds && arg.actionIds.length) {
      for (let l = 0; l < arg.actionIds.length; l++) {
        for (let i = 0; i < this.accessControls.length; i++) {
          if (this.accessControls[i].sub_menu.length) {
            for (let j = 0; j < this.accessControls[i].sub_menu.length; j++) {
              if (this.accessControls[i].sub_menu[j].action.length) {
                for (let k = 0; k < this.accessControls[i].sub_menu[j].action.length; k++) {
                  if (this.accessControls[i].sub_menu[j].action[k].action_id == arg.actionIds[l]) {
                    checkModule = this.accessControls[i].sub_menu[j].action[k];
                    break;
                  }
                }
              }
            }
          }
          if (this.accessControls[i].action.length) {
            for (let j = 0; j < this.accessControls[i].action.length; j++) {
              if (this.accessControls[i].action[j].action_id == arg.actionIds[l]) {
                checkModule = this.accessControls[i].action[j];
              }
            }
          }
        }
        if (checkModule) this.allIdAccess.push(checkModule.value);
      }
    } else if (arg.actionId) {
      for (let i = 0; i < this.accessControls.length; i++) {
        if (this.accessControls[i].sub_menu.length) {
          for (let j = 0; j < this.accessControls[i].sub_menu.length; j++) {
            if (this.accessControls[i].sub_menu[j].action.length) {
              for (let k = 0; k < this.accessControls[i].sub_menu[j].action.length; k++) {
                if (this.accessControls[i].sub_menu[j].action[k].action_id == arg.actionId) {
                  checkModule = this.accessControls[i].sub_menu[j].action[k];
                  break;
                }
              }
            }
          }
        }

        if (this.accessControls[i].action.length) {
          for (let j = 0; j < this.accessControls[i].action.length; j++) {
            if (this.accessControls[i].action[j].action_id == arg.actionId) {
              checkModule = this.accessControls[i].action[j];
            }
          }
        }
      }
    }
    if (checkModule) {
      if (checkModule.value === true) {
        return true;
      } else {
        return false;
      }
    }

    if (this.allIdAccess.length) {
      const isShowInMenu = this.allIdAccess.every(item => item === false);
      if (!isShowInMenu) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
