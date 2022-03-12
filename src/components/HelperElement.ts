import { VNode } from "vue";
import { HelperComponent } from "../../types";

export const HelperElement: HelperComponent = {
  name: "HelperElement",
  functional: true,
  render(h, { props }): VNode | VNode[] {
    const field = props.field;
    const descriptor = props.field.descriptor;

    if (descriptor.helper) {
      const tag = field.isRoot ? "p" : "span";
      const data = {
        attrs: {
          ...descriptor.helperAttrs,
          "data-fs-helper": true
        }
      };

      return h(tag, data, descriptor.helper);
    }

    return null as any; // render nothing
  }
};
