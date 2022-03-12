import { SetParser } from "@/parsers/SetParser";
import { Objects } from "@/lib/Objects";
import { Arrays } from "@/lib/Arrays";
import { Value } from "@/lib/Value";
import { ArrayUIDescriptor } from "@/descriptors/ArrayUIDescriptor";
import { ArrayField, ParserOptions, FieldKind, ArrayItemField, UnknowParser, ArrayDescriptor } from "../../types";
import { JsonSchema } from "../../types/jsonschema";
import { Parser } from "./Parser";

export class ArrayParser extends SetParser<any, ArrayField, ArrayDescriptor, ArrayUIDescriptor> {
  readonly items: JsonSchema[] = [];
  additionalItems?: JsonSchema;
  max = -1;
  count = 0;
  radioIndex = 0;
  childrenParsers: UnknowParser[] = [];

  constructor(options: ParserOptions<any, ArrayField, ArrayDescriptor>, parent?: UnknowParser) {
    super("array", options, parent);
  }

  get initialValue(): unknown[] {
    const value = this.options.model || this.schema.default;

    return value instanceof Array ? [ ...value ] : [];
  }

  get limit(): number {
    if (this.field.uniqueItems || this.items.length === 0) {
      return this.items.length;
    }

    if (this.count < this.field.minItems || !Array.isArray(this.schema.items)) {
      return this.count;
    }

    return this.count < this.items.length
      ? this.count
      : this.items.length;
  }

  get children(): ArrayItemField[] {
    const limit = this.limit;
    const fields = Array(...Array(limit))
      .map((x, index) => this.getFieldIndex(index))
      .filter((field) => field !== null) as ArrayItemField[];

    if (limit < this.count && this.additionalItems) {
      let index = limit;

      do {
        const additionalField = this.getFieldItem(this.additionalItems, index);

        if (additionalField === null) {
          break;
        }

        fields.push(additionalField);
      } while (++index < this.count);
    }

    return fields;
  }

  setFieldValue(field: ArrayItemField, value: unknown): void {
    // since it's possible to order children fields, the
    // current field's index must be computed each time
    // TODO: an improvement can be done by using a caching index table
    const index = this.childrenParsers.findIndex((parser) => parser.field === field);

    this.setIndexValue(index, value);
  }

  setIndexValue(index: number, value: unknown): void {
    this.rawValue[index] = value;

    this.setValue(this.rawValue);
  }

  isEmpty(data: unknown = this.model): boolean {
    return data instanceof Array && data.length === 0;
  }

  clearModel(): void {
    for (let i = 0; i < this.rawValue.length; i++) {
      this.rawValue[i] = undefined;
    }

    this.model.splice(0);
  }

  setValue(value: unknown[]): void {
    this.rawValue = value as any;

    this.model.splice(0);
    this.model.push(...this.parseValue(this.rawValue) as any);
  }

  reset(): void {
    this.clearModel();
    this.initialValue.forEach((value, index) => this.setIndexValue(index, value));
    this.childrenParsers.forEach((parser) => parser.reset());
  }

  clear(): void {
    this.clearModel();
    this.childrenParsers.forEach((parser) => parser.clear());
  }

  getFieldItemName(name: string, index: number): string {
    return this.root.options.bracketedObjectInputName ? `${name}[${index}]` : name;
  }

  getFieldItem(itemSchema: JsonSchema, index: number): ArrayItemField | null {
    const kind: FieldKind | undefined = this.field.uniqueItems
      ? "boolean"
      : SetParser.kind(itemSchema);

    const itemModel = typeof this.model[index] === "undefined"
      ? itemSchema.default
      : this.model[index];

    const itemDescriptor = this.options.descriptor && this.options.descriptor.items
      ? this.options.descriptor.items instanceof Array
        ? this.options.descriptor.items[index]
        : this.options.descriptor.items
      : { kind };

    const itemName = this.options.name || itemModel;
    const name = kind === "enum" && this.radioIndex++
      ? `${itemName}-${this.radioIndex}`
      : itemName;

    const itemParser = SetParser.get({
      kind: kind,
      schema: itemSchema,
      model: itemModel,
      id: `${this.id}-${index}`,
      name: this.getFieldItemName(name, index),
      descriptor: itemDescriptor,
      components: this.root.options.components
    }, this);

    if (this.rawValue.length <= index) {
      this.rawValue.push(undefined);
    }

    if (itemParser) {
      this.childrenParsers.push(itemParser);

      if (kind === "boolean") {
        this.parseCheckboxField(itemParser as Parser<any, any, any, any>, itemModel);
      }

      // update the index raw value
      this.rawValue[index] = itemParser.model;

      // set the onChange option after the parser initialization
      // to prevent first field value emit
      itemParser.options.onChange = this.field.sortable
        ? (value) => {
          this.setFieldValue(itemParser.field, value);
          this.commit();
        }
        : (value) => {
          this.setIndexValue(index, value);
          this.commit();
        };

      return itemParser.field;
    }

    return null;
  }

  getFieldIndex(index: number): ArrayItemField | null {
    const itemSchema = this.schema.items instanceof Array || this.field.uniqueItems
      ? this.items[index]
      : this.items[0];

    return this.getFieldItem(itemSchema, index);
  }

  move(from: number, to: number): ArrayItemField | undefined {
    const items = this.field.children;

    if (items[from] && items[to]) {
      const movedField = Arrays.swap<ArrayItemField>(items, from, to);

      Arrays.swap(this.rawValue, from, to);

      this.field.setValue(this.rawValue);
      this.parse();

      return movedField;
    }

    return undefined;
  }

  isDisabled([ from, to ]: [ number, number ]): boolean {
    return !this.field.sortable || !this.field.children[from] || !this.field.children[to];
  }

  upIndexes(itemField: ArrayItemField): [ number, number ] {
    const from = Arrays.index(this.field.children, itemField);
    const to = from - 1;

    return [ from, to ];
  }

  downIndexes(itemField: ArrayItemField): [ number, number ] {
    const from = Arrays.index(this.field.children, itemField);
    const to = from + 1;

    return [ from, to ];
  }

  setButtons(itemField: ArrayItemField): void {
    itemField.buttons = {
      moveUp: {
        disabled: this.isDisabled(this.upIndexes(itemField)),
        trigger: () => this.move(...this.upIndexes(itemField))
      },
      moveDown: {
        disabled: this.isDisabled(this.downIndexes(itemField)),
        trigger: () => this.move(...this.downIndexes(itemField))
      },
      delete: {
        disabled: !this.field.sortable,
        trigger: () => {
          const index = Arrays.index(this.field.children, itemField);
          const deletedField = this.field.children.splice(index, 1).pop();

          if (deletedField) {
            this.rawValue.splice(index, 1);
            this.field.setValue(this.rawValue);

            this.count--;

            this.requestRender();
          }

          return deletedField;
        }
      }
    };
  }

  setCount(value: number): boolean {
    if (this.schema.maxItems && value > this.field.maxItems) {
      return false;
    }

    this.count = value;
    this.radioIndex = 0;

    this.childrenParsers.splice(0);

    this.field.fields = {};
    this.field.children = this.children;

    this.field.children.forEach((item, i) => {
      this.field.fields[i] = item;
    });

    // apply array's model
    this.setValue(this.rawValue);

    this.field.children.forEach((itemField) => this.setButtons(itemField));

    return true;
  }

  parseField(): void {
    this.field.sortable = false;
    this.field.minItems = this.schema.minItems || (this.field.required ? 1 : 0);
    this.field.maxItems = typeof this.schema.maxItems === "number" && this.schema.maxItems > 0
      ? this.schema.maxItems
      : Number.MAX_SAFE_INTEGER;

    if (this.schema.items) {
      if (this.schema.items instanceof Array) {
        this.items.push(...this.schema.items);

        if (this.schema.additionalItems && !Objects.isEmpty(this.schema.additionalItems)) {
          this.additionalItems = this.schema.additionalItems;
        }
      } else {
        this.items.push(this.schema.items);

        this.field.sortable = true;
      }
    }

    const self = this;
    const resetField = this.field.reset;

    this.field.pushButton = {
      get disabled() {
        return self.count === self.max || self.items.length === 0;
      },
      trigger: () => this.setCount(this.count + 1) && this.requestRender()
    };

    this.count = this.field.minItems > this.model.length
      ? this.field.minItems
      : this.model.length;

    // force render update for ArrayField
    this.field.addItemValue = (itemValue: any) => {
      if (this.field.pushButton.disabled) {
        return false;
      }

      this.rawValue.push(itemValue);
      this.setValue(this.rawValue);
      this.field.pushButton.trigger();

      return true;
    };

    // force render update for ArrayField
    this.field.reset = () => {
      resetField.call(this.field);
      this.requestRender();
    };

    this.parseUniqueItems();
    this.setCount(this.count);
  }

  parseCheckboxField(parser: Parser<any, any, any, any>, itemModel: unknown): void {
    const isChecked = this.initialValue.includes(itemModel);

    parser.field.attrs.type = "checkbox";

    parser.setValue = (checked: boolean) => {
      parser.rawValue = checked;
      parser.model = checked ? itemModel : undefined;
    };

    parser.setValue(isChecked);
  }

  parseUniqueItems(): void {
    if (this.schema.uniqueItems === true && this.items.length === 1) {
      const itemSchema = this.items[0];

      if (itemSchema.enum instanceof Array) {
        this.field.uniqueItems = true;
        this.field.maxItems = itemSchema.enum.length;
        this.count = this.field.maxItems;

        this.items.splice(0);
        itemSchema.enum.forEach((value) => this.items.push({
          ...itemSchema,
          enum: undefined,
          default: value,
          title: `${value}`
        }));

        this.max = this.items.length;
      } else {
        this.max = this.schema.maxItems || this.items.length;
      }
    } else if (this.schema.maxItems) {
      this.max = this.field.maxItems;
    } else if (this.schema.items instanceof Array) {
      this.max = this.additionalItems ? -1 : this.items.length;
    } else {
      this.max = -2;
    }

    if (this.field.uniqueItems) {
      const values: unknown[] = [];

      this.items.forEach((itemSchema) => {
        if (this.model.includes(itemSchema.default)) {
          values.push(itemSchema.default);
        } else {
          values.push(undefined);
        }
      });

      this.model.splice(0);
      this.model.push(...values);
    }
  }

  parseValue(data: unknown[]): unknown[] {
    return Value.array(data);
  }
}

SetParser.register("array", ArrayParser);
