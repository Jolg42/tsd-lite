import type * as ts from "@tsd/typescript";
import type { AssertionResult } from "../types";
import { toAssertionResult } from "./";

export function expectType(
  checker: ts.TypeChecker,
  nodes: Set<ts.CallExpression>
): Array<AssertionResult> {
  const tsdResults: Array<AssertionResult> = [];

  if (!nodes) {
    return tsdResults;
  }

  for (const node of nodes) {
    if (!node.typeArguments) {
      continue;
    }

    const expectedType = checker.getTypeFromTypeNode(node.typeArguments[0]);
    const argumentType = checker.getTypeAtLocation(node.arguments[0]);

    if (!checker.isTypeAssignableTo(argumentType, expectedType)) {
      // The argument type is not assignable to the expected type. TypeScript will catch this for us.
      continue;
    }

    if (!checker.isTypeAssignableTo(expectedType, argumentType)) {
      tsdResults.push(
        toAssertionResult(
          node,
          `Parameter type '${checker.typeToString(
            expectedType
          )}' is declared too wide for argument type '${checker.typeToString(
            argumentType
          )}'.`
        )
      );
    } else if (!checker.isTypeIdenticalTo(expectedType, argumentType)) {
      /**
       * The expected type and argument type are assignable in both directions. We still have to check
       * if the types are identical. See https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#3.11.2.
       */
      tsdResults.push(
        toAssertionResult(
          node,
          `Parameter type '${checker.typeToString(
            expectedType
          )}' is not identical to argument type '${checker.typeToString(
            argumentType
          )}'.`
        )
      );
    }
  }

  return tsdResults;
}

export function expectNotType(
  checker: ts.TypeChecker,
  nodes: Set<ts.CallExpression>
): Array<AssertionResult> {
  const tsdResults: Array<AssertionResult> = [];

  if (!nodes) {
    return tsdResults;
  }

  for (const node of nodes) {
    if (!node.typeArguments) {
      continue;
    }

    const expectedType = checker.getTypeFromTypeNode(node.typeArguments[0]);
    const argumentType = checker.getTypeAtLocation(node.arguments[0]);

    if (checker.isTypeIdenticalTo(expectedType, argumentType)) {
      tsdResults.push(
        toAssertionResult(
          node,
          `Parameter type '${checker.typeToString(
            expectedType
          )}' is identical to argument type '${checker.typeToString(
            argumentType
          )}'.`
        )
      );
    }
  }

  return tsdResults;
}
