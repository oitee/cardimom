import * as utils from "../src/utilities.js";
import * as assert from "assert";

test("removeAll test", async () => {
    let result1 = utils.removeAll("<![CDATA[This is the very first post]]> https://exmaple.com", [/<!\[CDATA\[/g, /\]\]\>/g]);
    let result2= utils.removeAll("This is the very first post https://exmaple.com", [/<!\[CDATA\[/g, /\]\]\>/g]);
    assert.ok(result1 === "This is the very first post https://exmaple.com");
    assert.ok(result2 === "This is the very first post https://exmaple.com");
  });
