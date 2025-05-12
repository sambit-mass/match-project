import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrationState } from '@app/store';
import { TranslatePipe } from '@ngx-translate/core';
import { distinctUntilChanged, Observable } from 'rxjs';
import { TextAreaHeightDirective } from '@app/shared/directives';
import { ChatSocketIoService } from '@app/core/services/chat-socket-io.service';
import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TextAreaHeightDirective, TranslatePipe],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss',
})
export class RightPanelComponent implements OnInit, OnDestroy {
  private _store = inject(Store);
  private _toastr = inject(ToastrService);
  private socketService = inject(ChatSocketIoService);

  public bot: string = '';
  public image: string = '';
  public message: string = '';
  public username: string = '';
  public errorMessage: string = '';
  public disabled: boolean = true;
  public displayChatBox: boolean = false;
  public botMessageIndex: number | null | string = null;
  public allMessages = signal<{ sender: string; text: string; timestamp: string }[]>([]);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  private profileDetails$: Observable<IViewProfile | null> = this._store.select(
    RegistrationState.profileDetails
  );

  constructor() {
    // get the profile details
    this.profileDetails$.subscribe(res => {
      if (res) {
        this.username = res.user_first_name;
        this.image = res.profile_image;
      }
    });
  }

  ngOnInit(): void {
    this.socketService.connect();
    // get all messages
    this.socketService
      .onToken()
      .pipe(distinctUntilChanged())
      .subscribe({
        next: (token: any) => {
          this.bot += token;
          this.allMessages.update(msg => {
            const newText = this.bot;

            if (this.botMessageIndex === null) {
              const res = {
                sender: 'bot',
                text: newText,
                timestamp: this.getTime(),
              };
              this.botMessageIndex = msg.length;
              return [...msg, res];
            }
            this.scrollToBottom();

            return msg.map((msg, index) =>
              index === this.botMessageIndex ? { ...msg, text: newText } : msg
            );
          });
        },
      });

    // Reset state after the stream ends
    this.socketService.endResponse().subscribe(() => {
      this.botMessageIndex = null;
      this.disabled = true;
      this.bot = '';
    });
  }

  sendMessage() {
    this.errorMessage = '';
    if (!this.message.trim()) return;
    if (this.botMessageIndex == null && this.disabled && this.message.length < 500) {
      this.disabled = false;
      const res = {
        sender: this.username,
        text: this.message,
        timestamp: this.getTime(),
      };
      this.allMessages.update(msg => [...msg, res]);
      this.socketService.sendMessage(this.message);
      this.scrollToBottom();
      this.message = '';
    }
    // toaster for long msgs
    if (this.message.length > 500) {
      this._toastr.error(
        'The message you submitted was too long, please submit something shorter.',
        'Error',
        {
          closeButton: true,
          timeOut: 3000,
        }
      );
    }
    // error msg
    this.socketService.error().subscribe((err: any) => {
      this.disabled = true;
      this.errorMessage = err.error;
      this.scrollToBottom();
    });
  }

  // scroll down the chat
  private scrollToBottom(): void {
    if (this.chatContainer) {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  // get the local time
  private getTime(): string {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
