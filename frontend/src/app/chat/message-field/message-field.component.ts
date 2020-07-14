import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import 'quill-emoji';
import 'quill-mention';

import { User } from '@shared-interfaces';

@Component({
  selector: 'app-message-field',
  templateUrl: './message-field.component.html',
  styleUrls: ['./message-field.component.scss']
})
export class MessageFieldComponent implements OnInit, OnChanges {
  @Output() sendMessage = new EventEmitter();
  @Input() mention: User;
  @Input() to = '';

  @Input() disabled: boolean;

  editor = null;

  message: FormControl;
  editorStyles = {
    width: '100%',
    height: '100px',
    'max-width': '100%'
  };
  config = {
    keyboard: {
      bindings: {
        enter: {
          key: 13,
          handler: () => this.send()
        }
      }
    },
    'emoji-shortname': true,
    'emoji-textarea': true,
    'emoji-toolbar': true,
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      [{ direction: 'rtl' }], // text direction
      ['clean'], // remove formatting button
      ['link'] // link and image, video
    ]
  };

  ngOnInit(): void {
    this.message = new FormControl('', Validators.required);
  }

  bindEditor(quill: any) {
    this.editor = quill;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mention && changes.mention.currentValue) {
      const user = changes.mention.currentValue;

      this.message.setValue(`${this.message.value || ''} @${user.username}`);
    }
  }

  send = () => {
    const message = this.message.value;
    this.message.reset();
    this.sendMessage.emit(message);
  };

  get count() {
    return this.editor?.getText().length - 1;
  }

  get messageTo() {
    return `Message ${this.to}`;
  }
}
