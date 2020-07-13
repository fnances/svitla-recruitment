import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-inline-input',
  templateUrl: './inline-input.component.html',
  styleUrls: ['./inline-input.component.scss']
})
export class InlineInputComponent implements OnInit {
  @Output() search = new EventEmitter();
  @Output() enter = new EventEmitter();

  @Input() name = '';
  @Input() placeholder = '';
  @Input() icon: string;
  @Input() suggestions = [];

  phrase: FormControl;

  ngOnInit(): void {
    this.phrase = new FormControl('', [Validators.minLength(1)]);
  }
}
