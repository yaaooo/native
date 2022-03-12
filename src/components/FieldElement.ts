import { VNode } from "vue";
import { Field } from "@/lib/Field";
import { Dict, FieldComponent } from "../../types";

export const FieldElement: FieldComponent = {
  name: "FieldElement",
  functional: true,
  render(h, { data, props, children }): VNode | VNode[] {
    const field = props.field;
    const descriptor = props.field.descriptor;

    if (field.kind === "hidden" || descriptor.definition.kind === "hidden") {
      return children;
    }

    const type = descriptor.attrs.type || field.kind;
    const attrs: Dict = {
      "data-fs-kind": field.kind,
      "data-fs-type": type,
      "data-fs-field": field.name,
      "data-fs-required": field.required,
      "data-fs-horizontal": descriptor.props.horizontal
    };

    const labelElement = h("label", {
      attrs: descriptor.labelAttrs
    }, descriptor.label);

    const fieldElement = h("div", {
      attrs: {
        "data-fs-input": type
      },
      props: { field }
    }, children);

    const nodes = [ fieldElement ];
    const helperNode = h(descriptor.components.get("helper"), data);

    if (helperNode.tag) {
      nodes.push(helperNode);
    }

    Field.renderMessages(h, field, nodes);

    const wrapperElement = nodes.length === 1
      ? nodes
      : h("div", {
        attrs: {
          "data-fs-wrapper": nodes.length
        }
      }, nodes);

    return h("div", { attrs }, [ labelElement, wrapperElement ]);
  }
};
