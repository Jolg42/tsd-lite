import type * as ts from "@tsd/typescript";
import type { Diagnostic, Handler } from "../types";
import { isNotAssignable } from "./assignable";
import { expectDeprecated, expectNotDeprecated } from "./deprecated";
import { isIdentical, isNotIdentical } from "./identical";

export enum Assertion {
  EXPECT_TYPE = "expectType",
  EXPECT_NOT_TYPE = "expectNotType",
  EXPECT_ERROR = "expectError",
  EXPECT_ASSIGNABLE = "expectAssignable",
  EXPECT_NOT_ASSIGNABLE = "expectNotAssignable",
  EXPECT_DEPRECATED = "expectDeprecated",
  EXPECT_NOT_DEPRECATED = "expectNotDeprecated",
}

// List of diagnostic handlers attached to the assertion
const assertionHandlers = new Map<Assertion, Handler>([
  [Assertion.EXPECT_TYPE, isIdentical],
  [Assertion.EXPECT_NOT_TYPE, isNotIdentical],
  [Assertion.EXPECT_NOT_ASSIGNABLE, isNotAssignable],
  [Assertion.EXPECT_DEPRECATED, expectDeprecated],
  [Assertion.EXPECT_NOT_DEPRECATED, expectNotDeprecated],
]);

/**
 * Returns a list of diagnostics based on the assertions provided.
 *
 * @param typeChecker - The TypeScript type checker.
 * @param assertions - Assertion map with the key being the assertion, and the value the list of all those assertion nodes.
 * @returns List of diagnostics.
 */
export function handleAssertions(
  typeChecker: ts.TypeChecker,
  assertions: Map<Assertion, Set<ts.CallExpression>>
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const [assertion, nodes] of assertions) {
    const handler = assertionHandlers.get(assertion);

    if (!handler) {
      // Ignore these assertions as no handler is found
      continue;
    }

    diagnostics.push(...handler(typeChecker, nodes));
  }

  return diagnostics;
}
