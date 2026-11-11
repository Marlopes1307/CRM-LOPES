import { describe, expect, it } from "vitest";
import { commission, whatsappLink } from "./crm";

describe("crm rules", () => {
  it("calcula comissão de 6% sobre 500 mil", () => {
    expect(commission(500000, 6)).toBe(30000);
  });
  it("adiciona DDI 55 ao WhatsApp brasileiro", () => {
    expect(whatsappLink("(11) 98888-7777")).toBe("https://wa.me/5511988887777");
  });
});
