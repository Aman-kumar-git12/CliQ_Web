// Shared test setup: DOM matchers like toBeInTheDocument(), and a clean DOM after every test.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
