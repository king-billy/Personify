import "@testing-library/jest-dom/vitest";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import router from "next-router-mock";
import { vi } from "vitest";

beforeEach(() => router.setCurrentUrl("/"));

vi.mock("next/router", () => ({
	__esModule: true,
	default: router,
	useRouter: () => router,
}));

vi.mock("next/navigation", () => ({
	__esModule: true,
	...router,
	useRouter: () => router,
	usePathname: () => router.pathname,
}));
