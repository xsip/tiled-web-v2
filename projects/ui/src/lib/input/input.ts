import {Component, forwardRef, input} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
@Component({
  selector: 'tiled-web-ui-input',
  imports: [FormsModule],
  template: `
    <div>
      <label for="element{{id}}"
             class="block mb-2 text-sm font-medium text-secondary dark:text-white">{{ title() }}</label>
      <input type="text"
             [value]="value"
             (input)="handleInput($event)"
             (blur)="onTouched()"
             id="element{{id}}"
             class="bg-primary  border border-gray-300 text-secondary text-sm rounded-lg focus:ring-transparent focus:border-transparent block w-full p-2.5"
             placeholder="{{placeholder()}}" required/>
    </div>
  `,
  styles: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true
    }
  ]
})
export class Input  implements ControlValueAccessor{
  title = input.required<string>();
  placeholder = input<string>('');
  id = Date.now();

  value = '';

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(val: any): void {
    console.log(val);
    this.value = val ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

}
