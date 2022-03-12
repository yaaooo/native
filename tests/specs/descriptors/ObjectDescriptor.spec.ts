import { ObjectParser } from "@/parsers/ObjectParser";
import { TestParser, Scope } from "../../lib/TestParser";

describe("descriptors/ObjectDescriptor", () => {
  TestParser.Case({
    case: "1.0",
    description: "basic parsing",
    given: {
      parser: new ObjectParser({
        schema: {
          type: "object",
          properties: {
            name: { type: "string" }
          },
          required: [ "name" ]
        },
        model: { name: "Jon Snow" },
        name: "profile"
      })
    },
    expected: {
      parser: {
        kind: ({ value }: Scope) => expect(value).toBe("object"),
        fields({ value }: Scope) {
          for (const key in value) {
            expect(value[key].property).toBe(key);
            expect(value[key].deep).toBe(1);
          }
        },
        field: {
          value: ({ value }: Scope) => expect(value).toEqual({ name: "Jon Snow" }),
          attrs: {
            name: ({ value }: Scope) => expect(value).toBeUndefined(),
            required: ({ value }: Scope) => expect(value).toBeUndefined()
          },
          deep: ({ value }: Scope) => expect(value).toBe(0),
          fields({ value }: Scope) {
            for (const key in value) {
              expect(value[key].property).toBe(key);
              expect(value[key].deep).toBe(1);
            }
          }
        }
      }
    }
  });
});
