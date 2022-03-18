const { usePathToPosix, usePathInfo } = require("../lib/utils.cjs");
const { platform } = require("os");
test("usePathToPosix is ok", () => {
  const str = usePathToPosix("c:\\abc\\dfg");
  const str2 = usePathToPosix("abc/dfg");

  if (platform() === "win32") {
    expect(str).toBe("c:/abc/dfg");
    expect(str2).toBe("abc/dfg");
  } else {
    expect(str).toBe("c:\\abc\\dfg");
    expect(str2).toBe("abc/dfg");
  }
});

test("usePathInfo is ok", () => {
  const winPath = usePathInfo("c:\\abc\\dfg\\demo.js");
  const macPath = usePathInfo("abc/dfg/demo2.cjs");

  if (platform() === "win32") {
    expect(winPath.dirSrc).toBe("c:\\abc\\dfg");
    expect(winPath.extName).toBe(".js");
    expect(winPath.fileName).toBe("demo");
  }

  expect(macPath.dirSrc).toBe("abc/dfg");
  expect(macPath.extName).toBe(".cjs");
  expect(macPath.fileName).toBe("demo2");
});
